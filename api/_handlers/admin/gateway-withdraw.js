// Admin-only: withdraw funds from the MGM Pay merchant balance to a bank account.
// The gateway fee (payment_gateway.admin_withdraw_fee_pct, default 9.5%) is deducted first:
// payout sent = amount - fee.
import { createSettlement, errMsg, getPaymentMode, getSupabaseAdmin, getUserFromRequest, isAdmin, isOk, newOrderId, siteOrigin } from '../../_lib/mgm.js';
import { MGM_BANKS } from '../../../shared/mgm-banks.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });
  let supabaseAdmin;
  try { supabaseAdmin = getSupabaseAdmin(); } catch (e) { return res.status(500).json({ success: false, error: e.message }); }
  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user || !(await isAdmin(supabaseAdmin, user.id))) return res.status(403).json({ success: false, error: 'Access denied.' });

  const { amount: rawAmount, bankCode, accountNumber, accountName } = req.body || {};
  const amount = Math.round(Number(rawAmount) * 100) / 100;
  if (!Number.isFinite(amount) || amount < 100) return res.status(400).json({ success: false, error: 'Enter an amount of at least ₦100.' });
  const bank = MGM_BANKS.find(b => b.code === String(bankCode || ''));
  if (!bank) return res.status(400).json({ success: false, error: 'Select a supported bank.' });
  if (!/^\d{10}$/.test(String(accountNumber || '').trim())) return res.status(400).json({ success: false, error: 'Account number must be 10 digits.' });
  if (!String(accountName || '').trim()) return res.status(400).json({ success: false, error: 'Account name is required.' });

  const { feePct } = await getPaymentMode(supabaseAdmin);
  const fee = Math.round(amount * feePct) / 100;
  const payout = Math.round((amount - fee) * 100) / 100;
  if (payout <= 0) return res.status(400).json({ success: false, error: 'Amount is too small after fees.' });

  const orderId = newOrderId('GW');
  const { data: row, error } = await supabaseAdmin.from('gateway_admin_orders').insert({
    kind: 'withdraw', order_id: orderId, amount, fee, payout_amount: payout, bank_code: bank.code, bank_name: bank.name,
    account_name: String(accountName).trim(), account_number: String(accountNumber).trim(), admin_id: user.id
  }).select('id').single();
  if (error) return res.status(500).json({ success: false, error: error.message });

  try {
    const r = await createSettlement({
      orderId, amount: payout, notificationUrl: `${siteOrigin(req)}/api/mgm/payout-callback`,
      name: String(accountName).trim(), account: String(accountNumber).trim(), bankCode: bank.code
    });
    const ok = isOk(r);
    await supabaseAdmin.from('gateway_admin_orders').update({
      status: ok ? 'processing' : 'failed', gateway_ref: r?.data?.settlement_id || null, status_detail: ok ? null : errMsg(r), payload: r, updated_at: new Date().toISOString()
    }).eq('id', row.id);
    await supabaseAdmin.from('audit_logs').insert({ admin_id: user.id, action: 'gateway_withdraw', details: { order_id: orderId, amount, fee, payout, ok } });
    if (!ok) return res.status(502).json({ success: false, error: `Gateway rejected the withdrawal: ${errMsg(r)}` });
    return res.status(200).json({ success: true, order_id: orderId, amount, fee, payout });
  } catch (err) {
    await supabaseAdmin.from('gateway_admin_orders').update({ status: 'processing', status_detail: 'No response from gateway; awaiting callback', updated_at: new Date().toISOString() }).eq('id', row.id);
    return res.status(202).json({ success: true, order_id: orderId, amount, fee, payout, warning: 'Gateway did not respond; waiting for its callback.' });
  }
}
