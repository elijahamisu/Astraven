// MGM Pay (Naira) server-side helper. Never import from browser code.
// All MGM API calls go out through a relay on a whitelisted server (MGM_RELAY_URL),
// which forwards them over IPv4. Keys stay in Vercel env; the relay only lends its IP.
import crypto from 'node:crypto';
import https from 'node:https';
import http from 'node:http';
import { createClient } from '@supabase/supabase-js';

const BASES = { sandbox: 'https://api.mgm-paysandbox.com', production: 'https://api.mgm-pay.com' };

export function getConfig() {
  const env = (process.env.MGM_ENV || 'production').toLowerCase() === 'sandbox' ? 'sandbox' : 'production';
  const cfg = {
    base: (process.env.MGM_BASE_URL || BASES[env]).replace(/\/+$/, ''),
    merchantNo: process.env.MGM_MERCHANT_NO,
    appId: process.env.MGM_APP_ID,
    collectionKey: process.env.MGM_COLLECTION_KEY,
    payoutKey: process.env.MGM_PAYOUT_KEY,
    relayUrl: process.env.MGM_RELAY_URL || '',
    relaySecret: process.env.MGM_RELAY_SECRET || ''
  };
  if (!cfg.merchantNo || !cfg.appId || !cfg.collectionKey || !cfg.payoutKey) throw new Error('MGM Pay credentials are not configured.');
  if (cfg.relayUrl && !cfg.relaySecret) throw new Error('MGM_RELAY_SECRET is not configured.');
  return cfg;
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server credentials are not configured.');
  return createClient(url, key, { auth: { persistSession: false } });
}

export const money = (v) => Number(v).toFixed(2);

// Sign scalar, non-empty fields (excluding signature and nested objects), ASCII-sorted,
// name=value&...&key=SECRET, MD5 uppercase.
export function mgmSign(fields, secret) {
  const pairs = Object.keys(fields)
    .filter(k => k !== 'signature')
    .filter(k => { const v = fields[k]; return v !== null && v !== undefined && v !== '' && typeof v !== 'object'; })
    .sort()
    .map(k => `${k}=${fields[k]}`);
  return crypto.createHash('md5').update(`${pairs.join('&')}&key=${secret}`, 'utf8').digest('hex').toUpperCase();
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a || '').toUpperCase());
  const y = Buffer.from(String(b || '').toUpperCase());
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Verify a callback/response; amount may arrive as number (1250) or string ("1250.00")
export function verifySignature(data, secret) {
  if (!data || !data.signature) return false;
  const variants = [data];
  if (data.amount !== undefined) variants.push({ ...data, amount: money(data.amount) }, { ...data, amount: String(Number(data.amount)) });
  return variants.some(v => safeEqual(mgmSign(v, secret), data.signature));
}

function nonce() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.randomBytes(8), b => chars[b % chars.length]).join('');
}

// Raw HTTP(S) POST forced over IPv4
function postIPv4(url, headers, body, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'http:' ? http : https;
    const req = lib.request({
      method: 'POST', hostname: u.hostname, port: u.port || undefined, path: u.pathname + u.search,
      family: 4, headers: { ...headers, 'Content-Length': Buffer.byteLength(body) }, timeout: timeoutMs
    }, (res) => {
      let chunks = '';
      res.setEncoding('utf8');
      res.on('data', c => { chunks += c; });
      res.on('end', () => resolve({ status: res.statusCode, text: chunks }));
    });
    req.on('timeout', () => req.destroy(new Error('Gateway timeout')));
    req.on('error', reject);
    req.end(body);
  });
}

// Send { merchant_no, data } to MGM. amount is written with exactly two decimals.
async function call(path, data, { raw } = {}) {
  const cfg = getConfig();
  let body;
  if (raw) body = JSON.stringify(raw);
  else {
    const AMT = '__AMT__';
    const d = { ...data };
    if (d.amount !== undefined) d.amount = AMT;
    body = JSON.stringify({ merchant_no: cfg.merchantNo, data: d });
    if (data.amount !== undefined) body = body.replace(`"${AMT}"`, money(data.amount));
  }
  const headers = {
    'Content-Type': 'application/json',
    ApiVersion: '1.0',
    AppId: cfg.appId,
    Noncestr: nonce(),
    Timestamp: String(Date.now())
  };
  const target = cfg.base + path;

  let resp;
  if (cfg.relayUrl) {
    const envelope = JSON.stringify({ target, headers, body });
    const ts = String(Math.floor(Date.now() / 1000));
    const sig = crypto.createHmac('sha256', cfg.relaySecret).update(`${ts}.${envelope}`).digest('hex');
    const r = await postIPv4(cfg.relayUrl, { 'Content-Type': 'application/json', 'X-Relay-Timestamp': ts, 'X-Relay-Signature': sig }, envelope);
    let j; try { j = JSON.parse(r.text); } catch { throw new Error(`Relay error (HTTP ${r.status})`); }
    if (!j.ok) throw new Error(`Relay error: ${j.error || r.status}`);
    resp = { status: j.status, text: j.body };
  } else {
    resp = await postIPv4(target, headers, body);
  }
  try { return JSON.parse(resp.text); } catch { return { state: 'error', msg: `Invalid gateway response (HTTP ${resp.status})`, raw: String(resp.text).slice(0, 300) }; }
}

export const isOk = (r) => String(r?.state || '').toLowerCase() === 'ok';
export const errMsg = (r) => r?.errorMsg || r?.data?.status_detail || r?.msg || r?.message || r?.error || r?.data?.status_detail || (r?.code ? `code ${r.code}` : 'unknown error');

export async function createPayment({ orderId, amount, notificationUrl, returnUrl }) {
  const cfg = getConfig();
  const data = {
    country: 'NG', currency: 'NGN', payment_method_id: 'BANK_CARD', payment_method_flow: 'REDIRECT',
    order_id: orderId, amount: money(amount), notification_url: notificationUrl,
    success_redirect_url: returnUrl, timestamp: Date.now()
  };
  data.signature = mgmSign(data, cfg.collectionKey);
  return call('/api/pay/payment', data);
}

export async function createSettlement({ orderId, amount, notificationUrl, name, account, bankCode }) {
  const cfg = getConfig();
  const data = { country: 'NG', currency: 'NGN', order_id: orderId, amount: money(amount), notification_url: notificationUrl, timestamp: Date.now() };
  data.signature = mgmSign(data, cfg.payoutKey);
  data.payee = { name, account: String(account), account_type: 'BANK', bank_code: String(bankCode) };
  return call('/api/settle/settlement', data);
}

export async function getBalance() {
  const cfg = getConfig();
  const signature = crypto.createHash('md5').update(`merchant_no=${cfg.merchantNo}&key=${cfg.payoutKey}`, 'utf8').digest('hex').toUpperCase();
  return call('/api/merchant/balance', null, { raw: { merchant_no: cfg.merchantNo, signature, data: { merchant_no: cfg.merchantNo, signature } } });
}

export const queryPayment = (orderId) => call('/api/pay/queryPaymentOrder', null, { raw: { merchant_no: getConfig().merchantNo, data: { order_id: orderId } } });
export const querySettlement = (orderId) => call('/api/settle/querySettlementOrder', null, { raw: { merchant_no: getConfig().merchantNo, data: { order_id: orderId } } });

export async function getPaymentMode(supabaseAdmin) {
  const { data } = await supabaseAdmin.from('site_settings').select('value').eq('key', 'payment_gateway').maybeSingle();
  return { mode: data?.value?.mode === 'gateway' ? 'gateway' : 'manual', feePct: Number(data?.value?.admin_withdraw_fee_pct ?? 9.5) };
}

export function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return Object.fromEntries(new URLSearchParams(req.body)); } }
  return {};
}

// MGM expects the exact uppercase body SUCCESS
export function ackSuccess(res) { res.statusCode = 200; res.setHeader('Content-Type', 'text/plain'); res.end('SUCCESS'); }
export function ackFail(res, status = 400) { res.statusCode = status; res.setHeader('Content-Type', 'text/plain'); res.end('FAIL'); }

export async function getUserFromRequest(req, supabaseAdmin) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  return error || !data?.user ? null : data.user;
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

export function newOrderId(prefix) {
  return `${prefix}${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}
