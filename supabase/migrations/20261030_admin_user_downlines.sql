-- Admin view of a user's downline (levels 1-3) with activity status.
-- Active = has at least one running investment the downline bought themselves
-- (admin-granted packages don't count).
CREATE OR REPLACE FUNCTION public.admin_get_user_downlines(p_user_id uuid)
RETURNS TABLE (
  user_id uuid, level int, username text, full_name text, phone text, email text,
  joined_at timestamptz, is_suspended boolean,
  total_deposits numeric, deposit_count bigint,
  active_investments bigint, invested_amount numeric, is_active boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required.';
  END IF;

  RETURN QUERY
  WITH RECURSIVE tree AS (
    SELECT p.id, 1 AS lvl FROM public.profiles p WHERE p.referred_by = p_user_id
    UNION ALL
    SELECT p.id, t.lvl + 1 FROM public.profiles p JOIN tree t ON p.referred_by = t.id WHERE t.lvl < 3
  )
  SELECT p.id, t.lvl, p.username::text, p.full_name::text, p.phone::text, p.email::text,
         p.created_at, COALESCE(p.is_suspended, false),
         COALESCE(d.total, 0), COALESCE(d.cnt, 0),
         COALESCE(i.cnt, 0), COALESCE(i.amt, 0),
         COALESCE(i.cnt, 0) > 0
  FROM tree t
  JOIN public.profiles p ON p.id = t.id
  LEFT JOIN LATERAL (
    SELECT SUM(COALESCE(x.amount_paid, x.amount)) AS total, COUNT(*) AS cnt
    FROM public.deposits x
    WHERE x.user_id = p.id AND x.status IN ('approved', 'completed', 'success', 'paid')
  ) d ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt, SUM(v.purchase_price) AS amt
    FROM public.investments v
    WHERE v.user_id = p.id AND v.status = 'active'
      AND COALESCE((v.metadata->>'is_admin_grant')::boolean, false) = false
  ) i ON true
  ORDER BY t.lvl, p.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_get_user_downlines(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_user_downlines(uuid) TO authenticated, service_role;
