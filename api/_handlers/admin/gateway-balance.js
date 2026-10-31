// Admin-only: MGM Pay merchant balance.
import { errMsg, getBalance, getSupabaseAdmin, getUserFromRequest, isAdmin, isOk } from '../../_lib/mgm.js';

export default async function handler(req, res) {
  let supabaseAdmin;
  try { supabaseAdmin = getSupabaseAdmin(); } catch (e) { return res.status(500).json({ success: false, error: e.message }); }
  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user || !(await isAdmin(supabaseAdmin, user.id))) return res.status(403).json({ success: false, error: 'Access denied.' });
  try {
    const r = await getBalance();
    if (!isOk(r)) return res.status(502).json({ success: false, error: errMsg(r) });
    const d = r.data || {};
    return res.status(200).json({ success: true, available_balance: d.available_balance, freeze_balance: d.freeze_balance, total_balance: d.total_balance });
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message || 'Payment gateway is unreachable.' });
  }
}
