-- Admin product deletion.
-- No purchases -> hard delete. Has purchases -> archive (hidden everywhere,
-- not purchasable) so existing investments and history stay intact.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE OR REPLACE FUNCTION public.admin_delete_product(p_product_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_prod public.products%ROWTYPE;
  v_count bigint;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required.';
  END IF;

  SELECT * INTO v_prod FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Product not found.');
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.investments WHERE product_id = p_product_id;

  IF v_count = 0 THEN
    DELETE FROM public.products WHERE id = p_product_id;
  ELSE
    UPDATE public.products SET is_active = FALSE, archived_at = NOW(), updated_at = NOW()
     WHERE id = p_product_id;
  END IF;

  INSERT INTO public.audit_logs (admin_id, action, details)
  VALUES (auth.uid(), CASE WHEN v_count = 0 THEN 'product_deleted' ELSE 'product_archived' END,
          jsonb_build_object('product_id', v_prod.id, 'code', v_prod.code, 'name', v_prod.name, 'investments', v_count));

  RETURN jsonb_build_object('success', TRUE, 'mode', CASE WHEN v_count = 0 THEN 'deleted' ELSE 'archived' END,
                            'investments', v_count);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_delete_product(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_delete_product(uuid) TO authenticated, service_role;
