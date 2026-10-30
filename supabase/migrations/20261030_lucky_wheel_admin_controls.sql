-- Lucky Wheel: more slots (₦300, ₦100, Bad Luck), admin-chosen winning slot, admin spin grants.
ALTER TABLE public.lucky_wheel_config DROP CONSTRAINT IF EXISTS lucky_wheel_config_slot_number_check;
ALTER TABLE public.lucky_wheel_config ADD CONSTRAINT lucky_wheel_config_slot_number_check CHECK (slot_number BETWEEN 1 AND 12);

-- Lay out 9 slots, alternating big and small prizes around the wheel.
DELETE FROM public.lucky_wheel_config;
INSERT INTO public.lucky_wheel_config (slot_number, prize_amount, label, weight) VALUES
  (1, 600,  '₦600', 1),
  (2, 0,    '😢 Bad Luck', 1),
  (3, 1000, '₦1,000', 1),
  (4, 100,  '₦100', 1),
  (5, 2000, '₦2,000', 1),
  (6, 300,  '₦300', 1),
  (7, 4000, '₦4,000', 1),
  (8, 6000, '₦6,000', 1),
  (9, 8000, '₦8,000', 1);

INSERT INTO public.site_settings (key, value, description)
VALUES ('lucky_wheel_config', '{"winning_slot": 1}'::jsonb, 'Lucky Wheel: every spin lands on this slot')
ON CONFLICT (key) DO NOTHING;

-- Admin: choose the slot every spin lands on (its amount is the reward).
CREATE OR REPLACE FUNCTION public.admin_set_lucky_wheel_winning_slot(p_slot_number int)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_slot record;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Access denied: Admin role required.'; END IF;
  SELECT * INTO v_slot FROM public.lucky_wheel_config WHERE slot_number = p_slot_number;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Slot not found.'); END IF;

  INSERT INTO public.site_settings (key, value, description, updated_by, updated_at)
  VALUES ('lucky_wheel_config', jsonb_build_object('winning_slot', p_slot_number), 'Lucky Wheel: every spin lands on this slot', auth.uid(), NOW())
  ON CONFLICT (key) DO UPDATE SET value = public.site_settings.value || jsonb_build_object('winning_slot', p_slot_number),
                                  updated_by = auth.uid(), updated_at = NOW();

  INSERT INTO public.audit_logs (admin_id, action, details)
  VALUES (auth.uid(), 'LUCKY_WHEEL_WINNING_SLOT_SET', jsonb_build_object('slot', p_slot_number, 'amount', v_slot.prize_amount, 'label', v_slot.label));
  RETURN jsonb_build_object('success', TRUE, 'slot', p_slot_number, 'amount', v_slot.prize_amount);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_lucky_wheel_winning_slot(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_lucky_wheel_winning_slot(int) TO authenticated, service_role;

-- Admin: give a user free spins.
CREATE OR REPLACE FUNCTION public.admin_grant_lucky_wheel_spins(p_user_id uuid, p_count int, p_note text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_left int;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Access denied: Admin role required.'; END IF;
  IF p_count IS NULL OR p_count < 1 OR p_count > 100 THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Spins must be between 1 and 100.');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'User not found.');
  END IF;

  INSERT INTO public.lucky_wheel_spin_credits (user_id, source, source_id, note)
  SELECT p_user_id, 'admin', gen_random_uuid(), COALESCE(NULLIF(trim(p_note), ''), 'Granted by admin')
    FROM generate_series(1, p_count);

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (p_user_id, 'You received ' || p_count || ' Lucky Wheel spin' || CASE WHEN p_count > 1 THEN 's' ELSE '' END || '!',
          'Free spins have been added to your account. Head to the Lucky Wheel to use them.', 'reward');

  INSERT INTO public.audit_logs (admin_id, action, target_user_id, details)
  VALUES (auth.uid(), 'LUCKY_WHEEL_SPINS_GRANTED', p_user_id, jsonb_build_object('count', p_count, 'note', p_note));

  SELECT COUNT(*) INTO v_left FROM public.lucky_wheel_spin_credits WHERE user_id = p_user_id AND used_at IS NULL;
  RETURN jsonb_build_object('success', TRUE, 'granted', p_count, 'spins_left', v_left);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_grant_lucky_wheel_spins(uuid, int, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_grant_lucky_wheel_spins(uuid, int, text) TO authenticated, service_role;

-- Admin slot edit: allow custom label (emoji), keep audit with real admin id.
CREATE OR REPLACE FUNCTION public.admin_update_lucky_wheel_slot(p_admin_id uuid, p_slot_number integer, p_prize_amount numeric, p_label text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Access denied.'); END IF;
  IF p_prize_amount IS NULL OR p_prize_amount < 0 THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Invalid amount.'); END IF;
  UPDATE public.lucky_wheel_config
     SET prize_amount = p_prize_amount,
         label = COALESCE(NULLIF(trim(p_label), ''), CASE WHEN p_prize_amount = 0 THEN '😢 Bad Luck' ELSE '₦' || TO_CHAR(p_prize_amount, 'FM999,999,990') END),
         updated_at = NOW()
   WHERE slot_number = p_slot_number;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Slot not found.'); END IF;
  INSERT INTO public.audit_logs (admin_id, action, details)
  VALUES (COALESCE(auth.uid(), p_admin_id), 'LUCKY_WHEEL_SLOT_UPDATED', jsonb_build_object('slot', p_slot_number, 'amount', p_prize_amount, 'label', p_label));
  RETURN jsonb_build_object('success', TRUE);
END;
$$;

-- Spin: uses one earned spin and always lands on the admin's winning slot.
CREATE OR REPLACE FUNCTION public.spin_lucky_wheel(p_user_id uuid, p_idempotency_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_credit_id uuid;
  v_slot int;
  v_label text;
  v_prize numeric(16,2);
  v_wal record;
  v_spin_id uuid;
  v_spin_ref text;
  v_left int;
BEGIN
  SELECT id INTO v_credit_id FROM public.lucky_wheel_spin_credits
   WHERE user_id = p_user_id AND used_at IS NULL
   ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED;
  IF v_credit_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'spins_left', 0,
      'error', 'No spins left. Buy a package or invite a friend who deposits and invests to earn a spin.');
  END IF;

  SELECT c.slot_number, c.prize_amount, c.label INTO v_slot, v_prize, v_label
    FROM public.lucky_wheel_config c
   WHERE c.slot_number = COALESCE((SELECT (value->>'winning_slot')::int FROM public.site_settings WHERE key = 'lucky_wheel_config'), 1);
  IF v_slot IS NULL THEN
    SELECT slot_number, prize_amount, label INTO v_slot, v_prize, v_label FROM public.lucky_wheel_config ORDER BY slot_number LIMIT 1;
  END IF;
  v_prize := COALESCE(v_prize, 0);

  v_spin_ref := 'WHL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

  SELECT * INTO v_wal FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Wallet not found.'); END IF;

  INSERT INTO public.lucky_wheel_spins (user_id, slot_won, prize_amount, reference, status)
  VALUES (p_user_id, v_slot, v_prize, v_spin_ref, CASE WHEN v_prize > 0 THEN 'credited' ELSE 'no_prize' END)
  RETURNING id INTO v_spin_id;

  UPDATE public.lucky_wheel_spin_credits SET used_at = NOW(), spin_id = v_spin_id WHERE id = v_credit_id;

  IF v_prize > 0 THEN
    UPDATE public.wallets SET balance = balance + v_prize, total_earned = total_earned + v_prize, updated_at = NOW()
     WHERE user_id = p_user_id;
    INSERT INTO public.transactions (user_id, type, amount, balance_before, balance_after, reference, description, status)
    VALUES (p_user_id, 'lucky_wheel_prize', v_prize, v_wal.balance, v_wal.balance + v_prize, v_spin_ref, 'Lucky Wheel Prize Award', 'completed');
  END IF;

  SELECT COUNT(*) INTO v_left FROM public.lucky_wheel_spin_credits WHERE user_id = p_user_id AND used_at IS NULL;

  RETURN jsonb_build_object('success', TRUE, 'slot_won', v_slot, 'label', v_label, 'prize_amount', v_prize,
                            'reference', v_spin_ref, 'new_balance', v_wal.balance + v_prize, 'spins_left', v_left);
END;
$$;
REVOKE ALL ON FUNCTION public.spin_lucky_wheel(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spin_lucky_wheel(uuid, text) TO service_role;
