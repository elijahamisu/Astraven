// Afrstar collection webhook. Set this URL as the Collection callback in the merchant portal.
// Credits the wallet (and pays referral commission) only for a verified status = 1.
import { ackFail, ackSuccess, getSupabaseAdmin, readJsonBody, verifyCollectionCallback } from '../_lib/afrstar.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return ackFail(res, 405);

  const payload = readJsonBody(req);
  if (!payload?.order_sn || !payload?.platform_osn || payload.status === undefined || !payload.sign) return ackFail(res);

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: dep } = await supabaseAdmin
      .from('deposits')
      .select('id, amount, status, metadata, platform_osn')
      .eq('gateway_order_sn', String(payload.order_sn))
      .eq('gateway', 'afrstar')
      .maybeSingle();
    if (!dep) return ackFail(res, 404);

    // Sign with the ORIGINAL order amount (kept in metadata once the deposit is credited)
    const originalAmount = dep.metadata?.order_amount ?? dep.amount;
    if (!verifyCollectionCallback(payload, originalAmount)) return ackFail(res, 401);

    const { data, error } = await supabaseAdmin.rpc('confirm_gateway_deposit', {
      p_order_sn: String(payload.order_sn),
      p_platform_osn: String(payload.platform_osn),
      p_status: Number(payload.status),
      p_amount_paid: payload.amount_paid !== undefined && payload.amount_paid !== '' ? Number(payload.amount_paid) : Number(payload.amount || 0),
      p_payload: payload
    });

    if (error || !data?.success) {
      console.error('confirm_gateway_deposit failed', error?.message || data?.error);
      return ackFail(res, 500); // not acknowledged -> gateway retries
    }
    return ackSuccess(res);
  } catch (err) {
    console.error('collection-callback error', err);
    return ackFail(res, 500);
  }
}
