-- Lucky Wheel: earned spins, fixed ₦600 prize.
-- +1 spin for every package a user buys (ASTRA-VIP, SSVIP, Limited). Admin grants don't count.
-- +1 spin to the inviter, once per direct invitee, when that invitee has both
--   an approved deposit and a package they bought.

CREATE TABLE IF NOT EXISTS public.lucky_wheel_spin_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('purchase', 'referral', 'admin')),
  source_id uuid NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz,
  spin_id uuid REFERENCES public.lucky_wheel_spins(id),
  UNIQUE (source, source_id)
);
CREATE INDEX IF NOT EXISTS lucky_wheel_spin_credits_unused_idx
  ON public.lucky_wheel_spin_credits (user_id) WHERE used_at IS NULL;

ALTER TABLE public.lucky_wheel_spin_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own spin credits" ON public.lucky_wheel_spin_credits;
CREATE POLICY "Users view own spin credits" ON public.lucky_wheel_spin_credits
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view all spin credits" ON public.lucky_wheel_spin_credits;
CREATE POLICY "Admins view all spin credits" ON public.lucky_wheel_spin_credits
  FOR SELECT USING (public.is_admin());
REVOKE ALL ON public.lucky_wheel_spin_credits FROM anon;
GRANT SELECT ON public.lucky_wheel_spin_credits TO authenticated;

-- Referral spin: inviter gets one spin when this invitee has deposited AND bought.
CREATE OR REPLACE FUNCTION public.grant_referral_spin_if_eligible(p_invitee uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_referrer uuid;
  v_inserted int;
BEGIN
  SELECT referred_by INTO v_referrer FROM public.profiles WHERE id = p_invitee;
  IF v_referrer IS NULL THEN RETURN; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.deposits WHERE user_id = p_invitee AND status = 'approved') THEN RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.investments WHERE user_id = p_invitee
                  AND COALESCE((metadata->>'is_admin_grant')::boolean, false) = false) THEN RETURN; END IF;

  INSERT INTO public.lucky_wheel_spin_credits (user_id, source, source_id, note)
  SELECT v_referrer, 'referral', p_invitee, 'Invitee @' || COALESCE(username, '') || ' deposited and invested'
    FROM public.profiles WHERE id = p_invitee
  ON CONFLICT (source, source_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted > 0 THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_referrer, 'You earned a Lucky Wheel spin!',
            'A member you invited has deposited and invested. Your free spin is waiting on the Lucky Wheel.', 'reward');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_investment_spin_credit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF COALESCE((NEW.metadata->>'is_admin_grant')::boolean, false) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.lucky_wheel_spin_credits (user_id, source, source_id, note)
  VALUES (NEW.user_id, 'purchase', NEW.id, 'Purchased ' || COALESCE(NEW.product_name, 'package'))
  ON CONFLICT (source, source_id) DO NOTHING;

  PERFORM public.grant_referral_spin_if_eligible(NEW.user_id);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS investment_spin_credit ON public.investments;
CREATE TRIGGER investment_spin_credit AFTER INSERT ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.trg_investment_spin_credit();

CREATE OR REPLACE FUNCTION public.trg_deposit_referral_spin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved') THEN
    PERFORM public.grant_referral_spin_if_eligible(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS deposit_referral_spin ON public.deposits;
CREATE TRIGGER deposit_referral_spin AFTER INSERT OR UPDATE OF status ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.trg_deposit_referral_spin();

-- Spin: uses one earned spin; prize is always ₦600.
CREATE OR REPLACE FUNCTION public.spin_lucky_wheel(p_user_id uuid, p_idempotency_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_credit_id uuid;
  v_slot int;
  v_prize numeric(16,2) := 600;
  v_wal record;
  v_spin_id uuid;
  v_spin_ref text;
  v_left int;
BEGIN
  SELECT id INTO v_credit_id FROM public.lucky_wheel_spin_credits
   WHERE user_id = p_user_id AND used_at IS NULL
   ORDER BY created_at
   LIMIT 1 FOR UPDATE SKIP LOCKED;

  IF v_credit_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'spins_left', 0,
      'error', 'No spins left. Buy a package or invite a friend who deposits and invests to earn a spin.');
  END IF;

  SELECT slot_number INTO v_slot FROM public.lucky_wheel_config
   WHERE prize_amount = v_prize ORDER BY slot_number LIMIT 1;
  v_slot := COALESCE(v_slot, 1);

  SELECT * INTO v_wal FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Wallet not found.');
  END IF;

  UPDATE public.wallets
     SET balance = balance + v_prize, total_earned = total_earned + v_prize, updated_at = NOW()
   WHERE user_id = p_user_id;

  v_spin_ref := 'WHL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

  INSERT INTO public.lucky_wheel_spins (user_id, slot_won, prize_amount, reference, status)
  VALUES (p_user_id, v_slot, v_prize, v_spin_ref, 'credited')
  RETURNING id INTO v_spin_id;

  UPDATE public.lucky_wheel_spin_credits SET used_at = NOW(), spin_id = v_spin_id WHERE id = v_credit_id;

  INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, reference, description, status)
  VALUES (p_user_id, 'lucky_wheel_prize', v_prize, v_wal.balance, v_wal.balance + v_prize, v_spin_ref,
          'Lucky Wheel Prize Award', 'completed');

  SELECT COUNT(*) INTO v_left FROM public.lucky_wheel_spin_credits WHERE user_id = p_user_id AND used_at IS NULL;

  RETURN jsonb_build_object('success', TRUE, 'slot_won', v_slot, 'prize_amount', v_prize,
                            'reference', v_spin_ref, 'new_balance', v_wal.balance + v_prize, 'spins_left', v_left);
END;
$$;

-- These take a user id, so only the server (service_role) may call them.
REVOKE ALL ON FUNCTION public.spin_lucky_wheel(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spin_lucky_wheel(uuid, text) TO service_role;
REVOKE ALL ON FUNCTION public.execute_investment_purchase(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.execute_investment_purchase(uuid, uuid, text) TO service_role;
REVOKE ALL ON FUNCTION public.grant_referral_spin_if_eligible(uuid) FROM PUBLIC, anon, authenticated;
