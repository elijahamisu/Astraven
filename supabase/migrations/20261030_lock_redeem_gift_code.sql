-- redeem_gift_code takes p_user_id: server (service_role) only
REVOKE ALL ON FUNCTION public.redeem_gift_code(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_gift_code(uuid, text) TO service_role;
