// Afrstar Nigeria Payment API v2 — server-side helper (never import from browser code).
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const AFRSTAR_BASE_URL = (process.env.AFRSTAR_BASE_URL || 'https://ngn.afrstar.com').replace(/\/+$/, '');

export function getConfig() {
  const merchantSn = process.env.AFRSTAR_MERCHANT_SN;
  const ak = process.env.AFRSTAR_MERCHANT_AK;
  const sk = process.env.AFRSTAR_MERCHANT_SK;
  if (!merchantSn || !ak || !sk) throw new Error('Afrstar gateway credentials are not configured.');
  return { merchantSn, ak, sk };
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server credentials are not configured.');
  return createClient(url, key, { auth: { persistSession: false } });
}

// Amounts are always signed and sent with two decimals, e.g. "500.00"
export function money(value) {
  return Number(value).toFixed(2);
}

// md5 of the values concatenated with no separators, lowercase hex
export function sign(...values) {
  return crypto.createHash('md5').update(values.map(v => (v === null || v === undefined ? '' : String(v))).join(''), 'utf8').digest('hex');
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a || '').toLowerCase());
  const y = Buffer.from(String(b || '').toLowerCase());
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

async function post(path, body) {
  const res = await fetch(`${AFRSTAR_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { code: -1, message: `Invalid gateway response (HTTP ${res.status})`, raw: text.slice(0, 500) }; }
  return json;
}

// 2.1 Create a collection order
export async function createCollectionOrder({ orderSn, amount, name, email, phone, remark, redirectUrl }) {
  const { merchantSn, ak, sk } = getConfig();
  const amt = money(amount);
  return post('/gateway/payin/', {
    merchant_sn: merchantSn,
    order_sn: orderSn,
    amount: amt,
    name,
    email,
    phone,
    remark,
    redirect_url: redirectUrl,
    sign: sign(ak, orderSn, amt, sk)
  });
}

// 3.1 Create a payout order (Nigeria bank: type "bank", bank code in ifsc)
export async function createPayoutOrder({ orderSn, amount, name, account, bankCode, remark }) {
  const { merchantSn, ak, sk } = getConfig();
  const amt = money(amount);
  const upiHandle = '';
  return post('/gateway/payout/', {
    merchant_sn: merchantSn,
    order_sn: orderSn,
    amount: amt,
    type: 'bank',
    name,
    account,
    ifsc: bankCode,
    upi_handle: upiHandle,
    remark,
    sign: sign(ak, orderSn, account, upiHandle, amt, sk)
  });
}

// 4.1 Balance query
export async function getBalance() {
  const { merchantSn, ak, sk } = getConfig();
  return post('/gateway/balance/', { merchant_sn: merchantSn, sign: sign(ak, sk) });
}

// Collection callback: md5(merchant_ak + platform_osn + status + original_order_amount + merchant_sk)
export function verifyCollectionCallback(payload, originalOrderAmount) {
  const { merchantSn, ak, sk } = getConfig();
  if (String(payload.merchant_sn) !== String(merchantSn)) return false;
  const expected = sign(ak, payload.platform_osn, payload.status, money(originalOrderAmount), sk);
  return safeEqual(expected, payload.sign);
}

// Payout callback: md5(merchant_ak + platform_osn + status + amount + merchant_sk)
export function verifyPayoutCallback(payload, storedPayoutAmount) {
  const { merchantSn, ak, sk } = getConfig();
  if (String(payload.merchant_sn) !== String(merchantSn)) return false;
  if (money(payload.amount) !== money(storedPayoutAmount)) return false;
  const expected = sign(ak, payload.platform_osn, payload.status, money(storedPayoutAmount), sk);
  return safeEqual(expected, payload.sign);
}

export function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { /* fall through */ }
    return Object.fromEntries(new URLSearchParams(req.body));
  }
  return {};
}

// Callbacks must be acknowledged with HTTP 200 and the exact body "success"
export function ackSuccess(res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('success');
}

export function ackFail(res, status = 400) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain');
  res.end('fail');
}

export async function getUserFromRequest(req, supabaseAdmin) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function isAdmin(supabaseAdmin, userId) {
  const { data } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', userId).maybeSingle();
  return !!data && ['admin', 'superadmin'].includes(data.role);
}

export function siteOrigin(req) {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/+$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
}
