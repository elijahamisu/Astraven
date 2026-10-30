-- Withdrawals require at least one active self-bought investment
CREATE OR REPLACE FUNCTION public.request_gateway_withdrawal(p_user_id uuid, p_amount numeric, p_bank_code text, p_bank_name text, p_account_name text, p_account_number text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cfg jsonb;
  v_min NUMERIC(16,2);
  v_fee_val NUMERIC(16,2);
  v_fee NUMERIC(16,2);
  v_net NUMERIC(16,2);
  v_amount NUMERIC(16,2) := ROUND(p_amount, 2);
  v_wallet RECORD;
  v_ref TEXT;
  v_id UUID;
BEGIN
  IF v_amount IS NULL OR v_amount <= 0 THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Withdrawal amount must be greater than zero.');
  END IF;
  IF COALESCE(TRIM(p_bank_code), '') = '' OR TRIM(p_account_number) !~ '^\d{10}$' OR COALESCE(TRIM(p_account_name), '') = '' THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Valid bank, 10-digit account number and account name are required.');
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND is_suspended) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Account suspended.');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.investments i
     WHERE i.user_id = p_user_id AND i.status = 'active'
       AND COALESCE((i.metadata->>'is_admin_grant')::boolean, FALSE) = FALSE
  ) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'You need at least one active investment before you can withdraw. Buy a package to unlock withdrawals.');
  END IF;

  SELECT value INTO v_cfg FROM public.site_settings WHERE key = 'withdrawal_config';
  IF NOT COALESCE((v_cfg->>'is_enabled')::BOOLEAN, TRUE) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Withdrawals are temporarily offline.');
  END IF;
  v_min := COALESCE((v_cfg->>'min_withdrawal')::NUMERIC, 100.00);
  v_fee_val := COALESCE((v_cfg->>'fee_value')::NUMERIC, 5.0);
  IF v_amount < v_min THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Minimum withdrawal is ₦' || TO_CHAR(v_min, 'FM999,999,999.00'));
  END IF;

  IF COALESCE(v_cfg->>'fee_type', 'percentage') = 'percentage' THEN
    v_fee := ROUND(v_amount * (v_fee_val / 100.0), 2);
  ELSE
    v_fee := v_fee_val;
  END IF;
  v_net := v_amount - v_fee;
  IF v_net <= 0 THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Net amount after fee must be greater than zero.');
  END IF;

  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND OR v_wallet.balance < v_amount THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Insufficient available balance to fulfill this request.');
  END IF;

  UPDATE public.wallets
     SET balance = balance - v_amount, reserved_balance = reserved_balance + v_amount, updated_at = NOW()
   WHERE user_id = p_user_id;

  v_ref := 'WTH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));

  INSERT INTO public.withdrawals (user_id, reference, amount, fee, net_amount, bank_name, bank_code, account_name, account_number, status, gateway)
  VALUES (p_user_id, v_ref, v_amount, v_fee, v_net, TRIM(p_bank_name), TRIM(p_bank_code), TRIM(p_account_name), TRIM(p_account_number), 'pending', 'afrstar')
  RETURNING id INTO v_id;

  INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, reference, description, status, metadata)
  VALUES (p_user_id, 'withdrawal_request', -v_amount, v_wallet.balance, v_wallet.balance - v_amount, v_ref,
          'Withdrawal Request: ' || TRIM(p_bank_name), 'pending',
          jsonb_build_object('withdrawal_id', v_id, 'fee', v_fee, 'net', v_net));

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (p_user_id, 'Withdrawal Submitted: ₦' || TO_CHAR(v_net, 'FM999,999,999.00'),
          'Your withdrawal of ₦' || TO_CHAR(v_amount, 'FM999,999,999.00') || ' (net ₦' || TO_CHAR(v_net, 'FM999,999,999.00') || ') is awaiting admin approval.',
          'withdrawal');

  RETURN jsonb_build_object('success', TRUE, 'withdrawal_id', v_id, 'reference', v_ref, 'amount', v_amount,
                            'fee', v_fee, 'net_amount', v_net, 'new_balance', v_wallet.balance - v_amount);
END;
$function$;
