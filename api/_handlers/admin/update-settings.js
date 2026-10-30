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
    return res.status(403).json({ success: false, error: 'Access denied: Admin permissions required.' });
  }

  const { key, value } = req.body || {};
  if (!key || typeof value !== 'object') {
    return res.status(400).json({ success: false, error: 'Valid settings key and JSON object required.' });
  }

  const problem = validateSetting(key, value);
  if (problem) return res.status(400).json({ success: false, error: problem });

  try {
    const { data, error } = await supabaseAdmin.rpc('admin_update_site_setting', {
      p_admin_id: user.id,
      p_key: key,
      p_value: value
    });

    if (error || !data?.success) return res.status(400).json(data || { success: false, error: error.message });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal settings updater error.' });
  }
}

function num(v) { return typeof v === 'number' && Number.isFinite(v); }

function validateSetting(key, v) {
  if (key === 'withdrawal_config') {
    if (!num(v.min_withdrawal) || v.min_withdrawal <= 0) return 'Minimum withdrawal must be greater than 0.';
    if (!num(v.fee_value) || v.fee_value < 0 || v.fee_value >= 100) return 'Withdrawal fee must be between 0 and 99.99%.';
    if (typeof v.is_enabled !== 'boolean') return 'Withdrawal open/locked state is required.';
    return null;
  }
  if (key === 'deposit_config') {
    if (!num(v.min_deposit) || v.min_deposit <= 0) return 'Minimum deposit must be greater than 0.';
    return null;
  }
  if (key === 'referral_config') {
    if (!num(v.commission_rate) || v.commission_rate < 0 || v.commission_rate > 100) return 'Commission must be between 0 and 100%.';
    return null;
  }
  return null;
}
