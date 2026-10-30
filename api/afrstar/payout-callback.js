// Afrstar payout webhook. Set this URL as the Payout callback in the merchant portal.
// status 1 = paid, 9 = failed (amount refunded to the user's wallet).
import { ackFail, ackSuccess, getSupabaseAdmin, readJsonBody, verifyPayoutCallback } from '../_lib/afrstar.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return ackFail(res, 405);

  const payload = readJsonBody(req);
  if (!payload?.order_sn || !payload?.platform_osn || payload.status === undefined || !payload.sign) return ackFail(res);

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: w } = await supabaseAdmin
      .from('withdrawals')
      .select('id, net_amount, status')
      .eq('gateway_order_sn', String(payload.order_sn))
      .maybeSingle();
    if (!w) return ackFail(res, 404);

    if (!verifyPayoutCallback(payload, w.net_amount)) return ackFail(res, 401);

    const { data, error } = await supabaseAdmin.rpc('finalize_gateway_payout', {
      p_order_sn: String(payload.order_sn),
      p_platform_osn: String(payload.platform_osn),
      p_status: Number(payload.status),
      p_payload: payload
    });
    if (error || !data?.success) {
      console.error('finalize_gateway_payout failed', error?.message || data?.error);
      return ackFail(res, 500);
    }
    return ackSuccess(res);
  } catch (err) {
    console.error('payout-callback error', err);
    return ackFail(res, 500);
  }
}
