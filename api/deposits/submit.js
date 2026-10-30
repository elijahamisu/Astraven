// Creates an Afrstar collection order and returns the hosted checkout URL.
// The wallet is credited ONLY by /api/afrstar/collection-callback.
import { createCollectionOrder, getSupabaseAdmin, getUserFromRequest, siteOrigin } from '../_lib/afrstar.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  let supabaseAdmin;
  try { supabaseAdmin = getSupabaseAdmin(); } catch (e) { return res.status(500).json({ success: false, error: e.message }); }

  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid session.' });

  const amount = Math.round(Number((req.body || {}).amount) * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, error: 'Invalid deposit amount.' });

  const { data: dep, error } = await supabaseAdmin.rpc('create_gateway_deposit', { p_user_id: user.id, p_amount: amount });
  if (error || !dep?.success) return res.status(400).json({ success: false, error: dep?.error || error?.message || 'Could not create deposit.' });

  const { data: profile } = await supabaseAdmin.from('profiles').select('full_name, username, phone, email').eq('id', user.id).maybeSingle();
  const name = (profile?.full_name || profile?.username || 'Astraven Investor').slice(0, 64);
  const email = profile?.email || user.email || `${user.id}@astraven.app`;
  const phone = (profile?.phone || user.phone || '08000000000').replace(/[^\d+]/g, '') || '08000000000';

  try {
    const result = await createCollectionOrder({
      orderSn: dep.order_sn,
      amount: dep.amount,
      name,
      email,
      phone,
      remark: `Astraven deposit ${dep.reference}`,
      redirectUrl: `${siteOrigin(req)}/deposit-history?ref=${encodeURIComponent(dep.reference)}`
    });

    if (Number(result.code) !== 0 || !result.data?.pay_url) {
      await supabaseAdmin.rpc('fail_gateway_deposit', { p_deposit_id: dep.deposit_id, p_reason: result.message || 'Gateway rejected order' });
      return res.status(502).json({ success: false, error: `Payment gateway error: ${result.message || 'order not created'}` });
    }

    await supabaseAdmin.rpc('attach_gateway_deposit_order', {
      p_deposit_id: dep.deposit_id,
      p_platform_osn: result.data.platform_osn || null,
      p_pay_url: result.data.pay_url
    });

    return res.status(200).json({
      success: true,
      deposit_id: dep.deposit_id,
      reference: dep.reference,
      amount: dep.amount,
      pay_url: result.data.pay_url
    });
  } catch (err) {
    await supabaseAdmin.rpc('fail_gateway_deposit', { p_deposit_id: dep.deposit_id, p_reason: err.message });
    return res.status(502).json({ success: false, error: 'Payment gateway is unreachable. Please try again shortly.' });
  }
}
