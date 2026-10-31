// MGM Pay deposit (collection) callback: POST /api/mgm/deposit-callback
// Credits the wallet only for a verified status_code 100. Admin gateway top-ups (GT...) are recorded separately.
import { ackFail, ackSuccess, getConfig, getSupabaseAdmin, money, readJsonBody, verifySignature } from '../../_lib/mgm.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return ackFail(res, 405);
  const body = readJsonBody(req);
  const p = body?.data && typeof body.data === 'object' ? body.data : body;
  if (!p?.order_id || p.status_code === undefined || !p.signature) return ackFail(res);

  try {
    const cfg = getConfig();
    if (!verifySignature(p, cfg.collectionKey)) return ackFail(res, 401);
    if (p.currency && p.currency !== 'NGN') return ackFail(res);
    const supabaseAdmin = getSupabaseAdmin();
    const code = Number(p.status_code);
    const orderId = String(p.order_id);

    if (orderId.startsWith('GT')) {
      const { data: o } = await supabaseAdmin.from('gateway_admin_orders').select('amount').eq('order_id', orderId).maybeSingle();
      if (!o) return ackFail(res, 404);
      if (code === 100 && money(p.amount) !== money(o.amount)) return ackFail(res, 409);
      const { data, error } = await supabaseAdmin.rpc('mgm_settle_admin_order', { p_order_id: orderId, p_gateway_ref: p.payment_id || null, p_status_code: code, p_payload: p });
      return error || !data?.success ? ackFail(res, 500) : ackSuccess(res);
    }

    const { data: dep } = await supabaseAdmin.from('deposits').select('id, amount, status').eq('gateway_order_sn', orderId).eq('gateway', 'mgm').maybeSingle();
    if (!dep) return ackFail(res, 404);

    // 100 -> credit (sent as 1); 4/5/6 -> failed (sent negative); others -> progress only
    const mapped = code === 100 ? 1 : (-1 * code);
    const { data, error } = await supabaseAdmin.rpc('confirm_gateway_deposit', {
      p_order_sn: orderId,
      p_platform_osn: p.payment_id ? String(p.payment_id) : null,
      p_status: mapped,
      p_amount_paid: Number(p.amount || dep.amount),
      p_payload: p
    });
    if (error || !data?.success) { console.error('confirm_gateway_deposit', error?.message || data?.error); return ackFail(res, 500); }
    return ackSuccess(res);
  } catch (err) {
    console.error('mgm deposit-callback', err);
    return ackFail(res, 500);
  }
}
