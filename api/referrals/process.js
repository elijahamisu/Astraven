// Referral commission is paid automatically inside the verified Afrstar deposit
// webhook (confirm_gateway_deposit). This endpoint is an admin-only, idempotent
// re-run for a specific gateway deposit; manual deposits never earn commission.
import { getSupabaseAdmin, getUserFromRequest, isAdmin } from '../_lib/mgm.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  let supabaseAdmin;
  try { supabaseAdmin = getSupabaseAdmin(); } catch (e) { return res.status(500).json({ success: false, error: e.message }); }

  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid session.' });
  if (!(await isAdmin(supabaseAdmin, user.id))) return res.status(403).json({ success: false, error: 'Access denied.' });

  const { depositId } = req.body || {};
  if (!depositId) return res.status(400).json({ success: false, error: 'Deposit ID is required.' });

  try {
    const { data, error } = await supabaseAdmin.rpc('process_referral_commission', { p_deposit_id: depositId });
    if (error || !data?.success) return res.status(400).json(data || { success: false, error: error.message });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Referral commission processor error.' });
  }
}
