-- Welcome bonus on registration (default ₦600, site_settings.welcome_bonus.amount)
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check CHECK (type::text = ANY (ARRAY['deposit','withdrawal_request','withdrawal_payout','withdrawal_reversal','investment_purchase','daily_income','maturity_payout','referral_commission','referral_vip_reward','lucky_wheel_prize','gift_code_redemption','blog_bonus','manual_credit','manual_debit','welcome_bonus']::text[]));

INSERT INTO public.site_settings (key, value, description)
VALUES ('welcome_bonus', '{"amount": 600}'::jsonb, 'Bonus credited to every new account on registration')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_ref_code VARCHAR(16);
  v_referrer_id UUID := NULL;
  v_submitted_ref TEXT;
  v_bonus NUMERIC(16,2);
BEGIN
  -- Generate unique collision-resistant referral code
  v_ref_code := 'ASTRA' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));

  -- Lookup referrer code if provided
  v_submitted_ref := TRIM(COALESCE(NEW.raw_user_meta_data->>'referral_code', ''));
  IF v_submitted_ref <> '' THEN
    SELECT id INTO v_referrer_id
    FROM public.profiles
    WHERE UPPER(referral_code) = UPPER(v_submitted_ref)
      AND id <> NEW.id
      AND is_suspended = FALSE
    LIMIT 1;
  END IF;

  -- 1. Create Profile
  INSERT INTO public.profiles (
    id, username, full_name, phone, referral_code, referred_by
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'investor_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    v_ref_code,
    v_referrer_id
  ) ON CONFLICT (id) DO NOTHING;

  -- 2. Create Initial Wallet
  INSERT INTO public.wallets (
    user_id, balance, reserved_balance, total_deposited, total_withdrawn, total_earned
  ) VALUES (
    NEW.id, 0.00, 0.00, 0.00, 0.00, 0.00
  ) ON CONFLICT (user_id) DO NOTHING;

  -- 2b. Welcome bonus (amount from site_settings.welcome_bonus, default 600), once per user
  v_bonus := COALESCE((SELECT (value->>'amount')::numeric FROM public.site_settings WHERE key = 'welcome_bonus'), 600);
  IF v_bonus > 0 AND NOT EXISTS (
    SELECT 1 FROM public.transactions WHERE user_id = NEW.id AND type = 'welcome_bonus'
  ) THEN
    UPDATE public.wallets
       SET balance = balance + v_bonus, total_earned = total_earned + v_bonus, updated_at = NOW()
     WHERE user_id = NEW.id;
    INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, reference, description, status)
    VALUES (NEW.id, 'welcome_bonus', v_bonus, 0, v_bonus,
            'WEL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 6)),
            'Welcome Bonus', 'completed');
  END IF;

  -- 3. Assign Default Role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;

  -- 4. Create Granular Preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- 5. Record Lineage if valid referrer
  IF v_referrer_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id)
    VALUES (v_referrer_id, NEW.id)
    ON CONFLICT (referred_id) DO NOTHING;
  END IF;

  -- 6. Initial Welcome Notification
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    'Welcome to ASTRAVEN',
    'Your investor account is ready and a ₦' || TO_CHAR(v_bonus, 'FM999,999,990') || ' welcome bonus has been added to your wallet. Browse our verified ASTRA-VIP flight portfolios to activate daily settlements.',
    'system'
  );

  RETURN NEW;
END;
$function$;
