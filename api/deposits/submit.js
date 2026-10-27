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

  const { amount, senderName, transferRef, paymentDate, receiptUrl, idempotencyKey } = req.body || {};
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ success: false, error: 'Invalid deposit amount.' });

  try {
    const { data, error } = await supabaseAdmin.rpc('submit_deposit_request', {
      p_user_id: user.id,
      p_amount: numAmount,
      p_sender_name: senderName || '',
      p_transfer_ref: transferRef || '',
      p_payment_date: paymentDate || null,
      p_receipt_url: receiptUrl || null,
      p_idempotency_key: idempotencyKey || null
    });

    if (error || !data.success) return res.status(400).json(data || { success: false, error: error.message });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal deposit service error.' });
  }
}
