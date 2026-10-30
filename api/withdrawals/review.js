// Admin review of a withdrawal.
//  action "approve": locks the request, then sends the Afrstar payout order.
//  action "rejected": refunds the reserved amount (only while still pending).
// Final paid/failed status comes from /api/afrstar/payout-callback.
import { createPayoutOrder, getSupabaseAdmin, getUserFromRequest, isAdmin } from '../_lib/afrstar.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  let supabaseAdmin;
  try { supabaseAdmin = getSupabaseAdmin(); } catch (e) { return res.status(500).json({ success: false, error: e.message }); }

  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid session.' });
  if (!(await isAdmin(supabaseAdmin, user.id))) {
    return res.status(403).json({ success: false, error: 'Access denied: Administrative privileges required.' });
  }

  const { withdrawalId, action, rejectionReason } = req.body || {};
  if (!withdrawalId || !['approve', 'rejected'].includes(action)) {
    return res.status(400).json({ success: false, error: 'Valid withdrawalId and action (approve/rejected) required.' });
  }

  if (action === 'rejected') {
    const { data, error } = await supabaseAdmin.rpc('admin_reject_withdrawal', {
      p_withdrawal_id: withdrawalId,
      p_admin_id: user.id,
      p_reason: rejectionReason || 'Rejected by admin'
    });
    if (error || !data?.success) return res.status(400).json({ success: false, error: data?.error || error?.message });
    return res.status(200).json(data);
  }

  // Approve -> payout
  const { data: w, error: apprErr } = await supabaseAdmin.rpc('admin_approve_withdrawal', {
    p_withdrawal_id: withdrawalId,
    p_admin_id: user.id
  });
  if (apprErr || !w?.success) return res.status(400).json({ success: false, error: w?.error || apprErr?.message });

  try {
    const result = await createPayoutOrder({
      orderSn: w.order_sn,
      amount: w.amount,
      name: w.name,
      account: w.account,
      bankCode: w.bank_code,
      remark: `Astraven withdrawal ${w.order_sn}`
    });
    const ok = Number(result.code) === 0;
    await supabaseAdmin.rpc('record_withdrawal_payout_submission', {
      p_withdrawal_id: withdrawalId,
      p_ok: ok,
      p_platform_osn: result.data?.platform_osn || null,
      p_message: result.message || null,
      p_payload: result
    });
    if (!ok) {
      return res.status(502).json({ success: false, error: `Payout not accepted by gateway: ${result.message || 'unknown error'}. Request returned to pending.` });
    }
    return res.status(200).json({ success: true, status: 'processing', platform_osn: result.data?.platform_osn, payout_status: result.data?.status });
  } catch (err) {
    // Network error: the gateway may or may not have the order. Keep it 'processing'
    // so it is never paid twice; the payout callback will settle it.
    return res.status(202).json({ success: true, status: 'processing', warning: 'Gateway did not respond; awaiting payout callback.' });
  }
}
