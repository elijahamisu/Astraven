-- 1. Bound bank card (one per user)
CREATE TABLE IF NOT EXISTS public.user_bank_accounts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_code text NOT NULL,
  bank_name text NOT NULL,
  account_name text NOT NULL CHECK (length(trim(account_name)) BETWEEN 2 AND 120),
  account_number text NOT NULL CHECK (account_number ~ '^\d{10}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_bank_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own bank card read" ON public.user_bank_accounts;
DROP POLICY IF EXISTS "Own bank card insert" ON public.user_bank_accounts;
DROP POLICY IF EXISTS "Own bank card update" ON public.user_bank_accounts;
DROP POLICY IF EXISTS "Own bank card delete" ON public.user_bank_accounts;
CREATE POLICY "Own bank card read" ON public.user_bank_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Own bank card insert" ON public.user_bank_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own bank card update" ON public.user_bank_accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own bank card delete" ON public.user_bank_accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.user_bank_accounts FROM anon;

-- 2. Blog: optional second picture; admins can delete comments
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS image_url_2 text;
DROP POLICY IF EXISTS "Admins delete blog comments" ON public.blog_comments;
CREATE POLICY "Admins delete blog comments" ON public.blog_comments FOR DELETE TO authenticated USING (public.is_admin());

-- 3. Support: ended sessions are locked; sender comes from the session, not the client
CREATE OR REPLACE FUNCTION public.reply_support_ticket(p_ticket_id uuid, p_sender_id uuid, p_message text, p_attachment_url text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_ticket RECORD;
  v_sender uuid := COALESCE(auth.uid(), CASE WHEN auth.role() = 'service_role' THEN p_sender_id END);
  v_is_staff BOOLEAN := FALSE;
BEGIN
  IF v_sender IS NULL THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Please sign in again.'); END IF;
  IF length(trim(COALESCE(p_message, ''))) = 0 THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Message is empty.'); END IF;
  SELECT * INTO v_ticket FROM public.support_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Ticket not found.'); END IF;

  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_sender AND role IN ('admin', 'superadmin', 'support_agent')) INTO v_is_staff;
  IF NOT v_is_staff AND v_ticket.user_id <> v_sender THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Unauthorized ticket access.');
  END IF;
  IF v_ticket.status IN ('closed', 'resolved') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'This session has ended. Please start a new session.', 'ended', TRUE);
  END IF;

  INSERT INTO public.support_messages (ticket_id, sender_id, is_staff, message, attachment_url)
  VALUES (p_ticket_id, v_sender, v_is_staff, TRIM(p_message), p_attachment_url);

  UPDATE public.support_tickets
     SET last_message_at = NOW(), status = CASE WHEN v_is_staff THEN 'waiting_for_user' ELSE 'in_progress' END, updated_at = NOW()
   WHERE id = p_ticket_id;

  IF v_is_staff THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_ticket.user_id, 'Support Update: ' || v_ticket.ticket_ref,
            'A support officer has replied to your ticket: "' || SUBSTRING(p_message FROM 1 FOR 60) || '..."', 'support');
  END IF;
  RETURN jsonb_build_object('success', TRUE);
END;
$function$;

CREATE OR REPLACE FUNCTION public.end_support_ticket(p_ticket_id uuid)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_ticket RECORD; v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_uid AND role IN ('admin', 'superadmin', 'support_agent')) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Only support staff can end a session.');
  END IF;
  SELECT * INTO v_ticket FROM public.support_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Ticket not found.'); END IF;
  IF v_ticket.status = 'closed' THEN RETURN jsonb_build_object('success', TRUE, 'already', TRUE); END IF;

  INSERT INTO public.support_messages (ticket_id, sender_id, is_staff, message)
  VALUES (p_ticket_id, v_uid, TRUE, 'This session has been ended by support. If you need more help, please start a new session.');
  UPDATE public.support_tickets SET status = 'closed', last_message_at = NOW(), updated_at = NOW() WHERE id = p_ticket_id;
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_ticket.user_id, 'Support session ended: ' || v_ticket.ticket_ref, 'Your support session was closed. Start a new session anytime if you need more help.', 'support');
  RETURN jsonb_build_object('success', TRUE);
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_support_ticket(p_user_id uuid, p_subject text, p_category text, p_initial_message text, p_attachment_url text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_ticket_id UUID; v_ref TEXT;
  v_uid uuid := COALESCE(auth.uid(), CASE WHEN auth.role() = 'service_role' THEN p_user_id END);
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Please sign in again.'); END IF;
  v_ref := 'TCK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  INSERT INTO public.support_tickets (user_id, ticket_ref, subject, category, status, last_message_at)
  VALUES (v_uid, v_ref, TRIM(p_subject), TRIM(p_category), 'open', NOW()) RETURNING id INTO v_ticket_id;
  INSERT INTO public.support_messages (ticket_id, sender_id, is_staff, message, attachment_url)
  VALUES (v_ticket_id, v_uid, FALSE, TRIM(p_initial_message), p_attachment_url);
  RETURN jsonb_build_object('success', TRUE, 'ticket_id', v_ticket_id, 'ticket_ref', v_ref);
END;
$function$;

-- Users can no longer insert messages directly (must go through reply_support_ticket, which enforces the lock)
DROP POLICY IF EXISTS "Users insert messages to own tickets" ON public.support_messages;

REVOKE ALL ON FUNCTION public.end_support_ticket(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.end_support_ticket(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.reply_support_ticket(uuid,uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reply_support_ticket(uuid,uuid,text,text) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.create_support_ticket(uuid,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_support_ticket(uuid,text,text,text,text) TO authenticated, service_role;
