// Admin-only: top up the MGM Pay merchant balance via a cashier (collection) order.
import { createPayment, errMsg, getSupabaseAdmin, getUserFromRequest, isAdmin, isOk, newOrderId, siteOrigin } from '../../_lib/mgm.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });
  let supabaseAdmin;
  try { supabaseAdmin = getSupabaseAdmin(); } catch (e) { return res.status(500).json({ success: false, error: e.message }); }
  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user || !(await isAdmin(supabaseAdmin, user.id))) return res.status(403).json({ success: false, error: 'Access denied.' });

  const amount = Math.round(Number((req.body || {}).amount) * 100) / 100;
  if (!Number.isFinite(amount) || amount < 100 || amount > 50000000) return res.status(400).json({ success: false, error: 'Enter an amount between ₦100 and ₦50,000,000.' });

  const orderId = newOrderId('GT');
  const { data: row, error } = await supabaseAdmin.from('gateway_admin_orders').insert({ kind: 'topup', order_id: orderId, amount, admin_id: user.id }).select('id').single();
  if (error) return res.status(500).json({ success: false, error: error.message });

  const origin = siteOrigin(req);
  try {
    const r = await createPayment({ orderId, amount, notificationUrl: `${origin}/api/mgm/deposit-callback`, returnUrl: `${origin}/admin/gateway.html` });
    const url = r?.data?.redirect_url;
    if (!isOk(r) || !url) {
      await supabaseAdmin.from('gateway_admin_orders').update({ status: 'failed', status_detail: errMsg(r), payload: r, updated_at: new Date().toISOString() }).eq('id', row.id);
      return res.status(502).json({ success: false, error: `Gateway error: ${errMsg(r)}` });
    }
    await supabaseAdmin.from('gateway_admin_orders').update({ status: 'processing', redirect_url: url, gateway_ref: r.data.payment_id || null, payload: r, updated_at: new Date().toISOString() }).eq('id', row.id);
    await supabaseAdmin.from('audit_logs').insert({ admin_id: user.id, action: 'gateway_topup_created', details: { order_id: orderId, amount } });
    return res.status(200).json({ success: true, order_id: orderId, pay_url: url });
  } catch (err) {
    await supabaseAdmin.from('gateway_admin_orders').update({ status: 'failed', status_detail: err.message, updated_at: new Date().toISOString() }).eq('id', row.id);
    return res.status(502).json({ success: false, error: err.message || 'Payment gateway is unreachable.' });
  }
}
