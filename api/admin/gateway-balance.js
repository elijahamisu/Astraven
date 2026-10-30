// Admin-only: Afrstar merchant balance (POST /gateway/balance/).
import { getBalance, getSupabaseAdmin, getUserFromRequest, isAdmin } from '../_lib/afrstar.js';

export default async function handler(req, res) {
  let supabaseAdmin;
  try { supabaseAdmin = getSupabaseAdmin(); } catch (e) { return res.status(500).json({ success: false, error: e.message }); }
  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user || !(await isAdmin(supabaseAdmin, user.id))) return res.status(403).json({ success: false, error: 'Access denied.' });
  try {
    const result = await getBalance();
    if (Number(result.code) !== 0) return res.status(502).json({ success: false, error: result.message || 'Gateway error' });
    return res.status(200).json({ success: true, balance: result.data?.balance });
  } catch (err) {
    return res.status(502).json({ success: false, error: 'Payment gateway is unreachable.' });
  }
}
