// Creates an MGM Pay deposit order and returns the cashier URL.
// The wallet is credited ONLY by the verified callback /api/mgm/deposit-callback.
import { createPayment, errMsg, getPaymentMode, getSupabaseAdmin, getUserFromRequest, isOk, siteOrigin } from '../_lib/mgm.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  let supabaseAdmin;
  try { supabaseAdmin = getSupabaseAdmin(); } catch (e) { return res.status(500).json({ success: false, error: e.message }); }

  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid session.' });

  const { mode } = await getPaymentMode(supabaseAdmin);
  if (mode !== 'gateway') return res.status(400).json({ success: false, error: 'Automatic deposits are switched off. Please use manual bank transfer.' });

  const amount = Math.round(Number((req.body || {}).amount) * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, error: 'Invalid deposit amount.' });

  const { data: dep, error } = await supabaseAdmin.rpc('create_gateway_deposit', { p_user_id: user.id, p_amount: amount });
  if (error || !dep?.success) return res.status(400).json({ success: false, error: dep?.error || error?.message || 'Could not create deposit.' });

  const origin = siteOrigin(req);
  try {
    const result = await createPayment({
      orderId: dep.order_sn,
      amount: dep.amount,
      notificationUrl: `${origin}/api/mgm/deposit-callback`,
      returnUrl: `${origin}/deposit-history?ref=${encodeURIComponent(dep.reference)}`
    });
    const url = result?.data?.redirect_url;
    if (!isOk(result) || !url) {
      await supabaseAdmin.rpc('fail_gateway_deposit', { p_deposit_id: dep.deposit_id, p_reason: errMsg(result) });
      return res.status(502).json({ success: false, error: `Payment gateway error: ${errMsg(result)}` });
    }
    await supabaseAdmin.rpc('attach_gateway_deposit_order', { p_deposit_id: dep.deposit_id, p_platform_osn: result.data.payment_id || null, p_pay_url: url });
    return res.status(200).json({ success: true, deposit_id: dep.deposit_id, reference: dep.reference, amount: dep.amount, pay_url: url });
  } catch (err) {
    console.error('mgm createPayment', err);
    await supabaseAdmin.rpc('fail_gateway_deposit', { p_deposit_id: dep.deposit_id, p_reason: err.message });
    return res.status(502).json({ success: false, error: 'Payment gateway is unreachable. Please try again shortly.' });
  }
}
