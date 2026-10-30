CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  -- Server-side API routes call RPCs with the service_role key after verifying the
  -- caller is an admin themselves, so auth.uid() is NULL there. Trust service_role.
  SELECT COALESCE(auth.role(), '') = 'service_role'
      OR EXISTS (SELECT 1 FROM public.user_roles
                 WHERE user_id = auth.uid() AND role IN ('admin','superadmin'));
$$;
