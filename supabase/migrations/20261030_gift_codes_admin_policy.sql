-- Admins manage gift codes from the admin panel (RLS was on with no policies).
DROP POLICY IF EXISTS "Admins manage gift codes" ON public.gift_codes;
CREATE POLICY "Admins manage gift codes" ON public.gift_codes
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
REVOKE ALL ON public.gift_codes FROM anon;
