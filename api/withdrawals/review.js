import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized.' });

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ success: false, error: 'Invalid session.' });

  const { data: roleData } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', user.id).single();
  if (!roleData || !['admin', 'superadmin'].includes(roleData.role)) {
    return res.status(403).json({ success: false, error: 'Access denied: Administrative privileges required.' });
  }

  const { withdrawalId, action, paymentReference, rejectionReason } = req.body || {};
  if (!withdrawalId || !['paid', 'rejected'].includes(action)) {
    return res.status(400).json({ success: false, error: 'Valid withdrawalId and action (paid/rejected) required.' });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('review_withdrawal', {
      p_withdrawal_id: withdrawalId,
      p_admin_id: user.id,
      p_action: action,
      p_payment_reference: paymentReference || null,
      p_rejection_reason: rejectionReason || null
    });

    if (error || !data.success) return res.status(400).json(data || { success: false, error: error.message });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal withdrawal review processor error.' });
  }
}
