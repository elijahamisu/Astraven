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
  if (key === 'manual_deposit_config') {
    if (typeof v.is_enabled !== 'boolean') return 'Manual deposit on/off is required.';
    for (const f of ['bank_name', 'account_number', 'account_name', 'instructions']) {
      if (v[f] != null && (typeof v[f] !== 'string' || v[f].length > 500)) return 'Invalid ' + f.replace('_', ' ') + '.';
    }
    if (v.is_enabled && (!v.bank_name?.trim() || !/^\d{10}$/.test(v.account_number || '') || !v.account_name?.trim())) {
      return 'Bank name, 10-digit account number and account name are required to turn manual deposits on.';
    }
    return null;
  }
  if (key === 'payment_gateway') {
    if (!['gateway', 'manual'].includes(v.mode)) return 'Mode must be gateway or manual.';
    if (v.admin_withdraw_fee_pct != null && (!num(v.admin_withdraw_fee_pct) || v.admin_withdraw_fee_pct < 0 || v.admin_withdraw_fee_pct >= 100)) return 'Gateway fee must be between 0 and 99.99%.';
    return null;
  }
  if (key === 'welcome_bonus') {
    if (!num(v.amount) || v.amount < 0 || v.amount > 1000000) return 'Welcome bonus must be between 0 and 1,000,000.';
    return null;
  }
  if (key === 'referral_config') {
    if (!num(v.commission_rate) || v.commission_rate < 0 || v.commission_rate > 100) return 'Commission must be between 0 and 100%.';
    return null;
  }
  return null;
}
