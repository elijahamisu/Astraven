// MGM Pay withdrawal (settlement) callback: POST /api/mgm/payout-callback
// 100 = paid; 4 (failed) / 5 (returned) = refund the user. Admin gateway withdrawals (GW...) recorded separately.
import { ackFail, ackSuccess, getConfig, getSupabaseAdmin, money, readJsonBody, verifySignature } from '../../_lib/mgm.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return ackFail(res, 405);
  const body = readJsonBody(req);
  const p = body?.data && typeof body.data === 'object' ? body.data : body;
  if (!p?.order_id || p.status_code === undefined || !p.signature) return ackFail(res);

  try {
    const cfg = getConfig();
    if (!verifySignature(p, cfg.payoutKey)) return ackFail(res, 401);
    const supabaseAdmin = getSupabaseAdmin();
    const code = Number(p.status_code);
    const orderId = String(p.order_id);

    if (orderId.startsWith('GW')) {
      const { data, error } = await supabaseAdmin.rpc('mgm_settle_admin_order', { p_order_id: orderId, p_gateway_ref: p.settlement_id || null, p_status_code: code, p_payload: p });
      return error || !data?.success ? ackFail(res, 500) : ackSuccess(res);
    }

    const { data: w } = await supabaseAdmin.from('withdrawals').select('id, net_amount').eq('gateway_order_sn', orderId).maybeSingle();
    if (!w) return ackFail(res, 404);
    if (p.amount !== undefined && money(p.amount) !== money(w.net_amount)) return ackFail(res, 409);

    const mapped = code === 100 ? 1 : ([4, 5].includes(code) ? 9 : 1000 + code);
    const { data, error } = await supabaseAdmin.rpc('finalize_gateway_payout', {
      p_order_sn: orderId,
      p_platform_osn: p.settlement_id ? String(p.settlement_id) : null,
      p_status: mapped,
      p_payload: { ...p, message: p.status_detail }
    });
    if (error || !data?.success) { console.error('finalize_gateway_payout', error?.message || data?.error); return ackFail(res, 500); }
    return ackSuccess(res);
  } catch (err) {
    console.error('mgm payout-callback', err);
    return ackFail(res, 500);
  }
}
