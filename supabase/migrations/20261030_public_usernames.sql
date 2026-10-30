-- Investors can't read other profiles (RLS). Expose usernames only, for blog authors/commenters.
CREATE OR REPLACE FUNCTION public.get_public_usernames(p_user_ids uuid[])
RETURNS TABLE (id uuid, username text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT p.id, p.username::text FROM public.profiles p
  WHERE p.id = ANY (p_user_ids[1:200]);
$$;
REVOKE ALL ON FUNCTION public.get_public_usernames(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_public_usernames(uuid[]) TO authenticated, service_role;
