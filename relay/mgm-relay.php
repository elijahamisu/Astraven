<?php
/**
 * ASTRAVEN -> MGM Pay relay (upload to your IP-whitelisted server, e.g. public_html/mgm-relay.php).
 * It holds NO merchant keys. Vercel signs each MGM request, wraps it, and HMAC-signs the wrapper.
 * This script checks the HMAC, then forwards the request to MGM Pay over IPv4 only, so MGM
 * sees this server's whitelisted IPv4 address.
 *
 * Setup: put the same long random secret here (or in env MGM_RELAY_SECRET) and in Vercel's
 * MGM_RELAY_SECRET. Set Vercel MGM_RELAY_URL to https://<this-site>/mgm-relay.php
 * Visit ?ip=1 to see which IPv4 address MGM will see (give that to MGM for whitelisting).
 */
$RELAY_SECRET = getenv('MGM_RELAY_SECRET') ?: 'PASTE_THE_SAME_SECRET_AS_VERCEL_HERE';
$ALLOWED_HOSTS = ['api.mgm-pay.com', 'api.mgm-paysandbox.com'];
$ALLOWED_PATHS = ['/api/pay/payment', '/api/settle/settlement', '/api/merchant/balance', '/api/pay/queryPaymentOrder', '/api/settle/querySettlementOrder'];
$ALLOWED_HEADERS = ['Content-Type', 'ApiVersion', 'AppId', 'Noncestr', 'Timestamp'];

header('Content-Type: application/json');

function out($code, $arr) { http_response_code($code); echo json_encode($arr); exit; }

if (isset($_GET['ip'])) {
  $ch = curl_init('https://api.ipify.org');
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4, CURLOPT_TIMEOUT => 10]);
  $ip = curl_exec($ch); curl_close($ch);
  out(200, ['ok' => true, 'outbound_ipv4' => $ip]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok' => false, 'error' => 'POST only']);
if ($RELAY_SECRET === '' || strpos($RELAY_SECRET, 'PASTE_') === 0) out(500, ['ok' => false, 'error' => 'Relay secret not configured']);

$raw = file_get_contents('php://input');
$ts  = $_SERVER['HTTP_X_RELAY_TIMESTAMP'] ?? '';
$sig = $_SERVER['HTTP_X_RELAY_SIGNATURE'] ?? '';
if (!ctype_digit($ts) || abs(time() - (int)$ts) > 300) out(401, ['ok' => false, 'error' => 'Stale or missing timestamp']);
$expected = hash_hmac('sha256', $ts . '.' . $raw, $RELAY_SECRET);
if (!hash_equals($expected, strtolower($sig))) out(401, ['ok' => false, 'error' => 'Bad signature']);

$req = json_decode($raw, true);
if (!is_array($req) || empty($req['target']) || !isset($req['body'])) out(400, ['ok' => false, 'error' => 'Bad request']);
$u = parse_url($req['target']);
if (($u['scheme'] ?? '') !== 'https' || !in_array($u['host'] ?? '', $ALLOWED_HOSTS, true) || !in_array($u['path'] ?? '', $ALLOWED_PATHS, true) || isset($u['query'])) {
  out(403, ['ok' => false, 'error' => 'Target not allowed']);
}

$headers = [];
foreach ($ALLOWED_HEADERS as $h) {
  if (isset($req['headers'][$h])) $headers[] = $h . ': ' . preg_replace('/[\r\n]/', '', (string)$req['headers'][$h]);
}

$ch = curl_init($req['target']);
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => (string)$req['body'],
  CURLOPT_HTTPHEADER => $headers,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,   // force IPv4
  CURLOPT_CONNECTTIMEOUT => 10,
  CURLOPT_TIMEOUT => 25,
  CURLOPT_SSL_VERIFYPEER => true,
  CURLOPT_SSL_VERIFYHOST => 2,
]);
$body = curl_exec($ch);
if ($body === false) { $e = curl_error($ch); curl_close($ch); out(502, ['ok' => false, 'error' => 'Upstream: ' . $e]); }
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
out(200, ['ok' => true, 'status' => $status, 'body' => $body]);
