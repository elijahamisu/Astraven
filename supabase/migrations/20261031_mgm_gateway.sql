-- MGM Pay replaces Afrstar
CREATE OR REPLACE FUNCTION public.process_referral_commission(p_deposit_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_dep RECORD;
  v_referrer_id UUID;
  v_cfg jsonb;
  v_comm_rate NUMERIC(5,2);
  v_comm_amount NUMERIC(16,2);
  v_wal RECORD;
  v_tx_ref TEXT;
BEGIN
  SELECT * INTO v_dep FROM public.deposits WHERE id = p_deposit_id;
  IF NOT FOUND OR v_dep.status <> 'approved' THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Invalid or unapproved deposit.');
  END IF;

  IF NOT ((v_dep.gateway IN ('afrstar','mgm') AND COALESCE(v_dep.gateway_status, 0) = 1)
          OR (COALESCE(v_dep.gateway, 'manual') = 'manual' AND v_dep.reviewed_by IS NOT NULL)) THEN
    RETURN jsonb_build_object('success', TRUE, 'message', 'Commission applies only to confirmed gateway or admin-approved manual deposits.');
  END IF;

  IF EXISTS (SELECT 1 FROM public.referral_commissions WHERE deposit_id = p_deposit_id) THEN
    RETURN jsonb_build_object('success', TRUE, 'message', 'Commission already processed.');
  END IF;

  SELECT referred_by INTO v_referrer_id FROM public.profiles WHERE id = v_dep.user_id;
  IF v_referrer_id IS NULL OR v_referrer_id = v_dep.user_id THEN
    RETURN jsonb_build_object('success', TRUE, 'message', 'No valid referrer attached.');
  END IF;

  SELECT value INTO v_cfg FROM public.site_settings WHERE key = 'referral_config';
  v_comm_rate := COALESCE((v_cfg->>'commission_rate')::NUMERIC, 10.00);
  v_comm_amount := ROUND(v_dep.amount * (v_comm_rate / 100.0), 2);
  IF v_comm_amount <= 0 THEN
    RETURN jsonb_build_object('success', TRUE, 'message', 'Zero commission.');
  END IF;

  INSERT INTO public.wallets (user_id) VALUES (v_referrer_id) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_wal FROM public.wallets WHERE user_id = v_referrer_id FOR UPDATE;

  UPDATE public.wallets
     SET balance = balance + v_comm_amount,
         total_earned = total_earned + v_comm_amount,
         updated_at = NOW()
   WHERE user_id = v_referrer_id;

  v_tx_ref := 'COM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));

  INSERT INTO public.referral_commissions (deposit_id, referrer_id, referred_id, deposit_amount, commission_rate, commission_amount)
  VALUES (v_dep.id, v_referrer_id, v_dep.user_id, v_dep.amount, v_comm_rate, v_comm_amount);

  INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, reference, description, status, metadata)
  VALUES (v_referrer_id, 'referral_commission', v_comm_amount, v_wal.balance, v_wal.balance + v_comm_amount, v_tx_ref,
          TRIM(TO_CHAR(v_comm_rate, 'FM990.##')) || '% Referral Commission from downline deposit', 'completed',
          jsonb_build_object('deposit_id', v_dep.id, 'referred_user', v_dep.user_id, 'gateway', COALESCE(v_dep.gateway, 'manual')));

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_referrer_id,
          'Referral Commission Earned: ₦' || TO_CHAR(v_comm_amount, 'FM999,999,999.00'),
          'You received ₦' || TO_CHAR(v_comm_amount, 'FM999,999,999.00') || ' (' || TRIM(TO_CHAR(v_comm_rate, 'FM990.##')) || '%) from a downline deposit.',
          'referral');

  RETURN jsonb_build_object('success', TRUE, 'commission_amount', v_comm_amount, 'referrer_id', v_referrer_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.confirm_gateway_deposit(p_order_sn text, p_platform_osn text, p_status integer, p_amount_paid numeric, p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_dep RECORD;
  v_wallet RECORD;
  v_credit NUMERIC(16,2);
  v_comm jsonb;
BEGIN
  SELECT * INTO v_dep FROM public.deposits WHERE gateway_order_sn = p_order_sn AND gateway IN ('afrstar','mgm') FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Unknown order.');
  END IF;

  IF v_dep.platform_osn IS NOT NULL AND p_platform_osn IS NOT NULL AND v_dep.platform_osn <> p_platform_osn THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Platform order mismatch.');
  END IF;

  -- Already credited: acknowledge again, change nothing
  IF v_dep.status = 'approved' THEN
    RETURN jsonb_build_object('success', TRUE, 'duplicate', TRUE, 'status', 'approved');
  END IF;

  IF p_status <> 1 THEN
    -- MGM terminal failures arrive as negative codes (-4,-5,-6)
    IF p_status IN (-4,-5,-6) AND v_dep.status = 'pending' THEN
      UPDATE public.deposits SET status = 'failed', gateway_status = p_status, gateway_payload = p_payload,
             rejection_reason = COALESCE(p_payload->>'status_detail', 'Payment not completed'),
             platform_osn = COALESCE(platform_osn, p_platform_osn), updated_at = NOW() WHERE id = v_dep.id;
      RETURN jsonb_build_object('success', TRUE, 'status', 'failed', 'credited', FALSE);
    END IF;
    UPDATE public.deposits
       SET gateway_status = p_status, gateway_payload = p_payload,
           platform_osn = COALESCE(platform_osn, p_platform_osn), updated_at = NOW()
     WHERE id = v_dep.id;
    RETURN jsonb_build_object('success', TRUE, 'status', v_dep.status, 'credited', FALSE);
  END IF;

  -- Credit the amount actually paid (gateway may report a different amount)
  v_credit := ROUND(COALESCE(NULLIF(p_amount_paid, 0), v_dep.amount), 2);

  INSERT INTO public.wallets (user_id) VALUES (v_dep.user_id) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_dep.user_id FOR UPDATE;

  UPDATE public.wallets
     SET balance = balance + v_credit,
         total_deposited = total_deposited + v_credit,
         updated_at = NOW()
   WHERE user_id = v_dep.user_id;

  UPDATE public.deposits
     SET status = 'approved',
         amount = v_credit,
         amount_paid = v_credit,
         gateway_status = 1,
         gateway_payload = p_payload,
         platform_osn = COALESCE(platform_osn, p_platform_osn),
         transfer_reference = COALESCE(p_payload->>'utr', p_payload->>'session_id', transfer_reference),
         sender_name = COALESCE(p_payload->>'from_name', sender_name),
         paid_at = NOW(),
         reviewed_at = NOW(),
         metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('order_amount', v_dep.amount),
         updated_at = NOW()
   WHERE id = v_dep.id;

  INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, reference, description, status, metadata)
  VALUES (v_dep.user_id, 'deposit', v_credit, v_wallet.balance, v_wallet.balance + v_credit, v_dep.reference,
          'Deposit confirmed by payment gateway', 'completed',
          jsonb_build_object('deposit_id', v_dep.id, 'gateway', v_dep.gateway, 'platform_osn', COALESCE(v_dep.platform_osn, p_platform_osn)));

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_dep.user_id, 'Deposit Credited: ₦' || TO_CHAR(v_credit, 'FM999,999,999.00'),
          'Your payment was confirmed and your available balance has been credited.', 'wallet');

  -- Referral commission based on this gateway deposit (same transaction)
  v_comm := public.process_referral_commission(v_dep.id);

  RETURN jsonb_build_object('success', TRUE, 'status', 'approved', 'credited', v_credit, 'commission', v_comm);
END;
$function$;

CREATE OR REPLACE FUNCTION public.fail_gateway_deposit(p_deposit_id uuid, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.deposits
     SET status = 'failed', rejection_reason = LEFT(COALESCE(p_reason, 'Gateway order could not be created.'), 500), updated_at = NOW()
   WHERE id = p_deposit_id AND gateway IN ('afrstar','mgm') AND status = 'pending';
  RETURN jsonb_build_object('success', FOUND);
END;
$function$;

CREATE OR REPLACE FUNCTION public.attach_gateway_deposit_order(p_deposit_id uuid, p_platform_osn text, p_pay_url text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.deposits
     SET platform_osn = p_platform_osn, pay_url = p_pay_url, updated_at = NOW()
   WHERE id = p_deposit_id AND gateway IN ('afrstar','mgm');
  RETURN jsonb_build_object('success', FOUND);
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_gateway_deposit(p_user_id uuid, p_amount numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cfg jsonb;
  v_min NUMERIC(16,2);
  v_ref TEXT;
  v_id UUID;
  v_amount NUMERIC(16,2) := ROUND(p_amount, 2);
BEGIN
  IF v_amount IS NULL OR v_amount <= 0 THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Deposit amount must be greater than zero.');
  END IF;

  SELECT value INTO v_cfg FROM public.site_settings WHERE key = 'deposit_config';
  IF NOT COALESCE((v_cfg->>'is_enabled')::BOOLEAN, TRUE) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Deposits are temporarily offline for maintenance.');
  END IF;
  v_min := COALESCE((v_cfg->>'min_deposit')::NUMERIC, 100.00);
  IF v_amount < v_min THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Minimum deposit is ₦' || TO_CHAR(v_min, 'FM999,999,999.00'));
  END IF;

  IF COALESCE((SELECT value->>'mode' FROM public.site_settings WHERE key = 'payment_gateway'), 'manual') <> 'gateway' THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Automatic deposits are switched off. Please use manual bank transfer.');
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND is_suspended) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Account suspended.');
  END IF;

  v_ref := 'DEP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));

  INSERT INTO public.deposits (user_id, reference, amount, sender_name, transfer_reference, payment_date, status, gateway, gateway_order_sn, metadata)
  VALUES (p_user_id, v_ref, v_amount, NULL, NULL, CURRENT_DATE, 'pending', 'mgm', v_ref, jsonb_build_object('channel', 'mgm_payin'))
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', TRUE, 'deposit_id', v_id, 'reference', v_ref, 'order_sn', v_ref, 'amount', v_amount);
END;
$function$;

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
  VALUES (p_user_id, v_ref, v_amount, v_fee, v_net, TRIM(p_bank_name), TRIM(p_bank_code), TRIM(p_account_name), TRIM(p_account_number), 'pending', 'mgm')
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

CREATE OR REPLACE FUNCTION public.admin_approve_withdrawal(p_withdrawal_id uuid, p_admin_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_w RECORD;
BEGIN
  SELECT * INTO v_w FROM public.withdrawals WHERE id = p_withdrawal_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Withdrawal request not found.');
  END IF;
  IF v_w.status <> 'pending' THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Withdrawal is already ' || v_w.status || '.');
  END IF;
  IF COALESCE(v_w.bank_code, '') = '' THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'This request has no gateway bank code. Reject it so the user can resubmit.');
  END IF;

  UPDATE public.withdrawals
     SET status = 'processing',
         gateway = 'mgm',
         gateway_order_sn = COALESCE(gateway_order_sn, reference),
         approved_by = p_admin_id, approved_at = NOW(),
         reviewed_by = p_admin_id, reviewed_at = NOW(),
         payout_status = 'submitting',
         updated_at = NOW()
   WHERE id = p_withdrawal_id;

  INSERT INTO public.audit_logs (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, 'withdrawal_approved', v_w.user_id, jsonb_build_object('withdrawal_id', v_w.id, 'reference', v_w.reference, 'net_amount', v_w.net_amount));

  RETURN jsonb_build_object('success', TRUE, 'withdrawal_id', v_w.id, 'order_sn', COALESCE(v_w.gateway_order_sn, v_w.reference),
                            'amount', v_w.net_amount, 'name', v_w.account_name, 'account', v_w.account_number,
                            'bank_code', v_w.bank_code, 'user_id', v_w.user_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.finalize_gateway_payout(p_order_sn text, p_platform_osn text, p_status integer, p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_w RECORD;
  v_wallet RECORD;
BEGIN
  SELECT * INTO v_w FROM public.withdrawals WHERE gateway_order_sn = p_order_sn FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Unknown payout order.');
  END IF;
  IF v_w.platform_osn IS NOT NULL AND p_platform_osn IS NOT NULL AND v_w.platform_osn <> p_platform_osn THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Platform order mismatch.');
  END IF;
  IF v_w.status IN ('paid', 'failed', 'rejected') THEN
    RETURN jsonb_build_object('success', TRUE, 'duplicate', TRUE, 'status', v_w.status);
  END IF;
  IF v_w.status <> 'processing' THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Payout not in processing state.');
  END IF;

  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_w.user_id FOR UPDATE;

  IF p_status = 1 THEN
    UPDATE public.wallets
       SET reserved_balance = GREATEST(0, reserved_balance - v_w.amount), total_withdrawn = total_withdrawn + v_w.amount, updated_at = NOW()
     WHERE user_id = v_w.user_id;

    UPDATE public.withdrawals
       SET status = 'paid', payout_status = 'success', payout_payload = p_payload,
           platform_osn = COALESCE(platform_osn, p_platform_osn),
           payment_reference = COALESCE(p_payload->>'utr', p_platform_osn),
           completed_at = NOW(), updated_at = NOW()
     WHERE id = v_w.id;

    UPDATE public.transactions SET status = 'completed' WHERE reference = v_w.reference AND type = 'withdrawal_request';

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_w.user_id, 'Withdrawal Paid',
            'Your withdrawal of ₦' || TO_CHAR(v_w.net_amount, 'FM999,999,999.00') || ' has been sent to your bank account.', 'wallet');

    RETURN jsonb_build_object('success', TRUE, 'status', 'paid');

  ELSIF p_status = 9 THEN
    UPDATE public.wallets
       SET balance = balance + v_w.amount, reserved_balance = GREATEST(0, reserved_balance - v_w.amount), updated_at = NOW()
     WHERE user_id = v_w.user_id;

    UPDATE public.withdrawals
       SET status = 'failed', payout_status = 'failed', payout_payload = p_payload,
           platform_osn = COALESCE(platform_osn, p_platform_osn),
           rejection_reason = COALESCE(p_payload->>'message', 'Bank transfer failed'), updated_at = NOW()
     WHERE id = v_w.id;

    UPDATE public.transactions SET status = 'failed' WHERE reference = v_w.reference AND type = 'withdrawal_request';

    INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, reference, description, status, metadata)
    VALUES (v_w.user_id, 'withdrawal_reversal', v_w.amount, v_wallet.balance, v_wallet.balance + v_w.amount, 'REV-' || v_w.reference,
            'Refund for Failed Payout: ' || v_w.reference, 'completed', jsonb_build_object('withdrawal_id', v_w.id, 'gateway', v_w.gateway));

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_w.user_id, 'Withdrawal Failed & Refunded',
            'The bank transfer for ' || v_w.reference || ' failed. ₦' || TO_CHAR(v_w.amount, 'FM999,999,999.00') || ' has been returned to your wallet.', 'wallet');

    RETURN jsonb_build_object('success', TRUE, 'status', 'failed');
  END IF;

  UPDATE public.withdrawals SET payout_payload = p_payload, payout_status = 'status_' || p_status, updated_at = NOW() WHERE id = v_w.id;
  RETURN jsonb_build_object('success', TRUE, 'status', 'processing');
END;
$function$;

CREATE OR REPLACE FUNCTION public.review_deposit_request(p_deposit_id uuid, p_admin_id uuid, p_decision text, p_rejection_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_dep RECORD;
  v_wallet RECORD;
  v_bal_before NUMERIC(16, 2);
  v_bal_after NUMERIC(16, 2);
BEGIN
  -- Verify Admin Role
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Access denied: Admin role required.');
  END IF;

  -- Lock deposit row
  SELECT * INTO v_dep FROM public.deposits WHERE id = p_deposit_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Deposit record not found.');
  END IF;

  IF v_dep.status <> 'pending' THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Deposit has already been ' || v_dep.status);
  END IF;

  -- Gateway deposits are credited only by the verified Afrstar webhook
  IF v_dep.gateway IN ('afrstar','mgm') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Gateway deposits are settled automatically by the payment gateway.');
  END IF;

  IF p_decision = 'approved' THEN
    -- Guarantee wallet existence for target user
    INSERT INTO public.wallets (user_id, balance, reserved_balance, total_deposited, total_withdrawn, total_earned)
    VALUES (v_dep.user_id, 0.00, 0.00, 0.00, 0.00, 0.00)
    ON CONFLICT (user_id) DO NOTHING;

    -- Lock and credit user wallet
    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_dep.user_id FOR UPDATE;
    v_bal_before := COALESCE(v_wallet.balance, 0.00);
    v_bal_after := v_bal_before + v_dep.amount;

    UPDATE public.wallets
    SET balance = v_bal_after,
        total_deposited = total_deposited + v_dep.amount,
        updated_at = NOW()
    WHERE user_id = v_dep.user_id;

    -- Mark deposit approved
    UPDATE public.deposits
    SET status = 'approved',
        reviewed_by = p_admin_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_deposit_id;

    -- Write to auditable ledger
    INSERT INTO public.transactions (
      user_id,
      type,
      amount,
      balance_before,
      balance_after,
      reference,
      description,
      status,
      metadata
    ) VALUES (
      v_dep.user_id,
      'deposit',
      v_dep.amount,
      v_bal_before,
      v_bal_after,
      v_dep.reference,
      'Manual Bank Transfer Deposit Confirmed',
      'completed',
      jsonb_build_object('deposit_id', v_dep.id, 'reviewed_by', p_admin_id)
    );

    -- Notify User
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_dep.user_id,
      'Deposit Credited: ₦' || TO_CHAR(v_dep.amount, 'FM999,999,999.00'),
      'Your bank deposit has been verified and your available balance has been credited.',
      'wallet'
    );

    -- Secondary: Process referral commission safely without blocking deposit
    BEGIN
      PERFORM public.process_referral_commission(p_deposit_id);
    EXCEPTION WHEN OTHERS THEN
      -- Log notice without failing the main transaction
      RAISE NOTICE 'Referral commission skipped: %', SQLERRM;
    END;

    RETURN jsonb_build_object('success', TRUE, 'status', 'approved', 'balance', v_bal_after);

  ELSIF p_decision = 'rejected' THEN
    UPDATE public.deposits
    SET status = 'rejected',
        rejection_reason = COALESCE(p_rejection_reason, 'Payment transfer not verified with bank.'),
        reviewed_by = p_admin_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_deposit_id;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_dep.user_id,
      'Deposit Rejected',
      'Your deposit ' || v_dep.reference || ' was rejected: ' || COALESCE(p_rejection_reason, 'Transfer unverified.'),
      'wallet'
    );

    RETURN jsonb_build_object('success', TRUE, 'status', 'rejected');
  ELSE
    RETURN jsonb_build_object('success', FALSE, 'error', 'Invalid decision parameter.');
  END IF;
END;
$function$;

-- MGM Pay gateway (replaces Afrstar). Mode switch: gateway | manual.
INSERT INTO public.site_settings (key, value) VALUES
  ('payment_gateway', '{"mode":"manual","provider":"mgm","admin_withdraw_fee_pct":9.5}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Admin top-ups / withdrawals of the merchant (gateway) balance itself
CREATE TABLE IF NOT EXISTS public.gateway_admin_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('topup','withdraw')),
  order_id text NOT NULL UNIQUE,
  amount numeric(16,2) NOT NULL CHECK (amount > 0),
  fee numeric(16,2) NOT NULL DEFAULT 0,
  payout_amount numeric(16,2),
  bank_code text, bank_name text, account_name text, account_number text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','success','failed')),
  gateway_ref text, redirect_url text, status_code int, status_detail text,
  payload jsonb,
  admin_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gateway_admin_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read gateway orders" ON public.gateway_admin_orders;
CREATE POLICY "Admins read gateway orders" ON public.gateway_admin_orders FOR SELECT TO authenticated USING (public.is_admin());
REVOKE ALL ON public.gateway_admin_orders FROM anon;

-- Callback for admin top-up / withdraw orders (status_code 100 success; 4,5,6 failed)
CREATE OR REPLACE FUNCTION public.mgm_settle_admin_order(p_order_id text, p_gateway_ref text, p_status_code int, p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_o RECORD;
BEGIN
  SELECT * INTO v_o FROM public.gateway_admin_orders WHERE order_id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Unknown order.'); END IF;
  IF v_o.status IN ('success','failed') THEN RETURN jsonb_build_object('success', TRUE, 'duplicate', TRUE); END IF;
  UPDATE public.gateway_admin_orders
     SET status = CASE WHEN p_status_code = 100 THEN 'success' WHEN p_status_code IN (4,5,6) THEN 'failed' ELSE 'processing' END,
         status_code = p_status_code, status_detail = LEFT(p_payload->>'status_detail', 300),
         gateway_ref = COALESCE(gateway_ref, p_gateway_ref), payload = p_payload, updated_at = now()
   WHERE id = v_o.id;
  RETURN jsonb_build_object('success', TRUE);
END $$;

-- Manual-mode payout: admin paid the user outside the gateway
CREATE OR REPLACE FUNCTION public.admin_mark_withdrawal_paid(p_withdrawal_id uuid, p_admin_id uuid, p_reference text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_w RECORD;
BEGIN
  SELECT * INTO v_w FROM public.withdrawals WHERE id = p_withdrawal_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Withdrawal request not found.'); END IF;
  IF v_w.status <> 'pending' THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Only pending withdrawals can be marked paid (this one is ' || v_w.status || ').'); END IF;
  UPDATE public.wallets SET reserved_balance = GREATEST(0, reserved_balance - v_w.amount), total_withdrawn = total_withdrawn + v_w.amount, updated_at = now()
   WHERE user_id = v_w.user_id;
  UPDATE public.withdrawals SET status = 'paid', gateway = 'manual', payment_reference = NULLIF(trim(COALESCE(p_reference,'')), ''),
         reviewed_by = p_admin_id, reviewed_at = now(), approved_by = p_admin_id, approved_at = now(), completed_at = now(), updated_at = now()
   WHERE id = v_w.id;
  UPDATE public.transactions SET status = 'completed' WHERE reference = v_w.reference AND type = 'withdrawal_request';
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_w.user_id, 'Withdrawal Paid', 'Your withdrawal of ₦' || TO_CHAR(v_w.net_amount, 'FM999,999,999.00') || ' has been sent to your bank account.', 'wallet');
  INSERT INTO public.audit_logs (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, 'withdrawal_marked_paid', v_w.user_id, jsonb_build_object('withdrawal_id', v_w.id, 'reference', p_reference));
  RETURN jsonb_build_object('success', TRUE, 'status', 'paid');
END $$;

DO $$ DECLARE f text; BEGIN
  FOREACH f IN ARRAY ARRAY['mgm_settle_admin_order(text,text,int,jsonb)','admin_mark_withdrawal_paid(uuid,uuid,text)',
    'create_gateway_deposit(uuid,numeric)','fail_gateway_deposit(uuid,text)','attach_gateway_deposit_order(uuid,text,text)',
    'confirm_gateway_deposit(text,text,integer,numeric,jsonb)','request_gateway_withdrawal(uuid,numeric,text,text,text,text)',
    'admin_approve_withdrawal(uuid,uuid)','admin_reject_withdrawal(uuid,uuid,text)','record_withdrawal_payout_submission(uuid,boolean,text,text,jsonb)',
    'finalize_gateway_payout(text,text,integer,jsonb)'] LOOP
    EXECUTE 'REVOKE ALL ON FUNCTION public.' || f || ' FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.' || f || ' TO service_role';
  END LOOP;
END $$;
