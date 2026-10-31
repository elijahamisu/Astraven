// ASTRAVEN -> MGM Pay relay, Node.js version (use instead of mgm-relay.php if the
// whitelisted server runs Node). No dependencies: `MGM_RELAY_SECRET=... PORT=8080 node mgm-relay-node.cjs`
// Put it behind HTTPS and set Vercel MGM_RELAY_URL to its public URL.
const http = require('http');
const https = require('https');
const crypto = require('crypto');

const SECRET = process.env.MGM_RELAY_SECRET || '';
const ALLOWED_HOSTS = ['api.mgm-pay.com', 'api.mgm-paysandbox.com'];
const ALLOWED_PATHS = ['/api/pay/payment', '/api/settle/settlement', '/api/merchant/balance', '/api/pay/queryPaymentOrder', '/api/settle/querySettlementOrder'];
const ALLOWED_HEADERS = ['Content-Type', 'ApiVersion', 'AppId', 'Noncestr', 'Timestamp'];

const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

http.createServer((req, res) => {
  if (req.method === 'GET' && req.url.includes('ip=1')) {
    return https.get({ hostname: 'api.ipify.org', family: 4 }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => send(res, 200, { ok: true, outbound_ipv4: d })); })
      .on('error', e => send(res, 502, { ok: false, error: e.message }));
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'POST only' });
  if (!SECRET) return send(res, 500, { ok: false, error: 'Relay secret not configured' });
  let raw = '';
  req.on('data', c => { raw += c; if (raw.length > 1e6) req.destroy(); });
  req.on('end', () => {
    const ts = String(req.headers['x-relay-timestamp'] || '');
    const sig = String(req.headers['x-relay-signature'] || '').toLowerCase();
    if (!/^\d+$/.test(ts) || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return send(res, 401, { ok: false, error: 'Stale or missing timestamp' });
    const expected = crypto.createHmac('sha256', SECRET).update(`${ts}.${raw}`).digest('hex');
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return send(res, 401, { ok: false, error: 'Bad signature' });
    let r; try { r = JSON.parse(raw); } catch { return send(res, 400, { ok: false, error: 'Bad request' }); }
    let u; try { u = new URL(r.target); } catch { return send(res, 400, { ok: false, error: 'Bad target' }); }
    if (u.protocol !== 'https:' || !ALLOWED_HOSTS.includes(u.hostname) || !ALLOWED_PATHS.includes(u.pathname) || u.search) return send(res, 403, { ok: false, error: 'Target not allowed' });
    const headers = {};
    for (const h of ALLOWED_HEADERS) if (r.headers && r.headers[h] != null) headers[h] = String(r.headers[h]).replace(/[\r\n]/g, '');
    const body = String(r.body || '');
    headers['Content-Length'] = Buffer.byteLength(body);
    const up = https.request({ method: 'POST', hostname: u.hostname, path: u.pathname, headers, family: 4, timeout: 25000 }, ur => {
      let d = ''; ur.setEncoding('utf8'); ur.on('data', c => d += c); ur.on('end', () => send(res, 200, { ok: true, status: ur.statusCode, body: d }));
    });
    up.on('timeout', () => up.destroy(new Error('timeout')));
    up.on('error', e => send(res, 502, { ok: false, error: 'Upstream: ' + e.message }));
    up.end(body);
  });
}).listen(process.env.PORT || 8080);
