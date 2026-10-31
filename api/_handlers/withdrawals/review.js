// Admin review of a user withdrawal.
//  gateway mode: "approve" = Send to Gateway (MGM payout), "rejected" = refund.
//  manual mode:  "paid" = admin paid outside the gateway, "rejected" = refund.
// Final gateway status comes from /api/mgm/payout-callback.
import { createSettlement, errMsg, getPaymentMode, getSupabaseAdmin, getUserFromRequest, isAdmin, isOk, siteOrigin } from '../../_lib/mgm.js';
import { resolveMgmBank } from '../../../shared/mgm-banks.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  let supabaseAdmin;
  try { supabaseAdmin = getSupabaseAdmin(); } catch (e) { return res.status(500).json({ success: false, error: e.message }); }

  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid session.' });
  if (!(await isAdmin(supabaseAdmin, user.id))) return res.status(403).json({ success: false, error: 'Access denied: Administrative privileges required.' });

  const { withdrawalId, action, rejectionReason, paymentReference } = req.body || {};
  if (!withdrawalId || !['approve', 'rejected', 'paid'].includes(action)) {
    return res.status(400).json({ success: false, error: 'Valid withdrawalId and action (approve/paid/rejected) required.' });
  }

  if (action === 'rejected') {
    const { data, error } = await supabaseAdmin.rpc('admin_reject_withdrawal', { p_withdrawal_id: withdrawalId, p_admin_id: user.id, p_reason: rejectionReason || 'Rejected by admin' });
    if (error || !data?.success) return res.status(400).json({ success: false, error: data?.error || error?.message });
    return res.status(200).json(data);
  }

  const { mode } = await getPaymentMode(supabaseAdmin);

  if (action === 'paid') {
    if (mode !== 'manual') return res.status(400).json({ success: false, error: 'Gateway mode is on. Use Send to Gateway, or switch to manual mode first.' });
    const { data, error } = await supabaseAdmin.rpc('admin_mark_withdrawal_paid', { p_withdrawal_id: withdrawalId, p_admin_id: user.id, p_reference: paymentReference || null });
    if (error || !data?.success) return res.status(400).json({ success: false, error: data?.error || error?.message });
    return res.status(200).json(data);
  }

  // approve -> send to gateway
  if (mode !== 'gateway') return res.status(400).json({ success: false, error: 'Manual mode is on. Mark it paid after transferring, or switch to gateway mode.' });

  const { data: row } = await supabaseAdmin.from('withdrawals').select('bank_code, bank_name').eq('id', withdrawalId).maybeSingle();
  const bank = resolveMgmBank(row?.bank_code, row?.bank_name);
  if (!bank) return res.status(400).json({ success: false, error: `Bank "${row?.bank_name || ''}" isn't supported by the gateway. Reject it so the user can resubmit, or pay manually.` });
  if (row.bank_code !== bank.code) await supabaseAdmin.from('withdrawals').update({ bank_code: bank.code }).eq('id', withdrawalId);

  const { data: w, error: apprErr } = await supabaseAdmin.rpc('admin_approve_withdrawal', { p_withdrawal_id: withdrawalId, p_admin_id: user.id });
  if (apprErr || !w?.success) return res.status(400).json({ success: false, error: w?.error || apprErr?.message });

  try {
    const result = await createSettlement({
      orderId: w.order_sn,
      amount: w.amount,
      notificationUrl: `${siteOrigin(req)}/api/mgm/payout-callback`,
      name: w.name,
      account: w.account,
      bankCode: bank.code
    });
    const ok = isOk(result);
    await supabaseAdmin.rpc('record_withdrawal_payout_submission', {
      p_withdrawal_id: withdrawalId, p_ok: ok, p_platform_osn: result?.data?.settlement_id || null, p_message: errMsg(result), p_payload: result
    });
    if (!ok) return res.status(502).json({ success: false, error: `Gateway didn't accept the payout: ${errMsg(result)}. Request returned to pending.` });
    return res.status(200).json({ success: true, status: 'processing', settlement_id: result.data?.settlement_id });
  } catch (err) {
    // Unknown outcome: keep 'processing' so it can never be paid twice; the callback settles it.
    console.error('mgm createSettlement', err);
    return res.status(202).json({ success: true, status: 'processing', warning: 'Gateway did not respond; waiting for its callback before anything else happens.' });
  }
}
