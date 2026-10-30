-- Manual bank-transfer deposits: user submits proof, admin approves; referral commission applies on approval.
INSERT INTO public.site_settings (key, value, description)
VALUES ('manual_deposit_config', '{"is_enabled": false, "bank_name": "", "account_number": "", "account_name": "", "instructions": ""}'::jsonb,
        'Manual bank transfer deposit account details')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.submit_manual_deposit(p_amount numeric, p_sender_name text, p_transfer_ref text, p_receipt_path text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_dep jsonb; v_man jsonb;
  v_min numeric; v_id uuid; v_ref text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Please sign in again.'); END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid AND is_suspended) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Account suspended.');
  END IF;
  SELECT value INTO v_dep FROM public.site_settings WHERE key = 'deposit_config';
  SELECT value INTO v_man FROM public.site_settings WHERE key = 'manual_deposit_config';
  IF COALESCE((v_dep->>'is_enabled')::boolean, TRUE) = FALSE OR COALESCE((v_man->>'is_enabled')::boolean, FALSE) = FALSE THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Manual deposits are not available right now.');
  END IF;
  v_min := COALESCE((v_dep->>'min_deposit')::numeric, 100);
  IF p_amount IS NULL OR p_amount < v_min THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Minimum deposit is ₦' || TO_CHAR(v_min, 'FM999,999,990'));
  END IF;
  IF length(trim(COALESCE(p_sender_name, ''))) < 2 THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Enter the name on the account you paid from.');
  END IF;
  IF COALESCE(p_receipt_path, '') = '' OR split_part(p_receipt_path, '/', 1) <> v_uid::text THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Upload your payment receipt.');
  END IF;
  IF (SELECT count(*) FROM public.deposits WHERE user_id = v_uid AND status = 'pending' AND gateway = 'manual') >= 3 THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'You already have pending manual deposits awaiting review.');
  END IF;

  v_ref := 'MAN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
  INSERT INTO public.deposits (user_id, reference, amount, sender_name, transfer_reference, payment_date, receipt_url, status, gateway)
  VALUES (v_uid, v_ref, ROUND(p_amount, 2), trim(p_sender_name), NULLIF(trim(COALESCE(p_transfer_ref, '')), ''), CURRENT_DATE, p_receipt_path, 'pending', 'manual')
  RETURNING id INTO v_id;

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_uid, 'Deposit submitted', 'Your bank transfer of ₦' || TO_CHAR(p_amount, 'FM999,999,990.00') || ' (' || v_ref || ') is awaiting admin confirmation.', 'wallet');
  RETURN jsonb_build_object('success', TRUE, 'deposit_id', v_id, 'reference', v_ref);
END;
$$;
REVOKE ALL ON FUNCTION public.submit_manual_deposit(numeric, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_manual_deposit(numeric, text, text, text) TO authenticated;

-- review_deposit_request was executable by anon; admin check inside, but tighten anyway.
REVOKE ALL ON FUNCTION public.review_deposit_request(uuid, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_deposit_request(uuid, uuid, text, text) TO authenticated, service_role;

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

  IF NOT ((v_dep.gateway = 'afrstar' AND COALESCE(v_dep.gateway_status, 0) = 1)
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
