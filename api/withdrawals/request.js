// User withdrawal request: funds are reserved and the request waits for admin approval.
import { getSupabaseAdmin, getUserFromRequest } from '../_lib/afrstar.js';
import { AFRSTAR_BANKS } from '../../shared/afrstar-banks.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  let supabaseAdmin;
  try { supabaseAdmin = getSupabaseAdmin(); } catch (e) { return res.status(500).json({ success: false, error: e.message }); }

  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid session.' });

  const { amount, bankCode, accountName, accountNumber } = req.body || {};
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) return res.status(400).json({ success: false, error: 'Invalid withdrawal amount.' });

  const bank = AFRSTAR_BANKS.find(b => b.code === String(bankCode || ''));
  if (!bank) return res.status(400).json({ success: false, error: 'Please select a supported bank.' });
  if (!/^\d{10}$/.test(String(accountNumber || '').trim())) return res.status(400).json({ success: false, error: 'Account number must be exactly 10 digits.' });
  if (!String(accountName || '').trim()) return res.status(400).json({ success: false, error: 'Account name is required.' });

  try {
    const { data, error } = await supabaseAdmin.rpc('request_gateway_withdrawal', {
      p_user_id: user.id,
      p_amount: numAmount,
      p_bank_code: bank.code,
      p_bank_name: bank.name,
      p_account_name: String(accountName).trim(),
      p_account_number: String(accountNumber).trim()
    });
    if (error || !data?.success) return res.status(400).json({ success: false, error: data?.error || error?.message || 'Withdrawal failed.' });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal withdrawal service error.' });
  }
}
