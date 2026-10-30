import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing bearer token.' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session.' });
  }

  // Verify Admin Role
  const { data: roleRow } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!roleRow || !['admin', 'superadmin'].includes(roleRow.role)) {
    return res.status(403).json({ success: false, error: 'Access denied: Admin permissions required.' });
  }

  const { targetUserId, productId, reason } = req.body || {};

  if (!targetUserId || !productId) {
    return res.status(400).json({ success: false, error: 'Both targetUserId and productId are required.' });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('admin_grant_user_product', {
      p_admin_id: user.id,
      p_target_user_id: targetUserId,
      p_product_id: productId,
      p_reason: reason || 'Executive Package Grant'
    });

    if (error || !data?.success) {
      return res.status(400).json(data || { success: false, error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Package grant error:', err);
    return res.status(500).json({ success: false, error: 'Internal package grant service failure.' });
  }
}
