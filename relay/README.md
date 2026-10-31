# MGM Pay relay

MGM Pay only accepts API calls from whitelisted IPs. Vercel has no fixed IP, so Vercel signs every
MGM request (keys stay in Vercel env) and hands it to this relay on your whitelisted server, which
forwards it to MGM over IPv4 only. The relay never sees your merchant keys.

1. Upload `mgm-relay.php` to the whitelisted site (PHP + cURL), or run `mgm-relay-node.cjs` if it is Node.
2. Set the same long random secret in the relay and in Vercel `MGM_RELAY_SECRET`.
3. Open `https://<relay-site>/mgm-relay.php?ip=1` and give MGM the `outbound_ipv4` it shows.
4. Vercel env: `MGM_RELAY_URL=https://<relay-site>/mgm-relay.php`

Vercel env vars: MGM_ENV (production | sandbox), MGM_MERCHANT_NO, MGM_APP_ID, MGM_COLLECTION_KEY,
MGM_PAYOUT_KEY, MGM_RELAY_URL, MGM_RELAY_SECRET.

Callbacks (MGM calls Vercel directly, no whitelist needed):
- Deposit:    https://astraven-eight.vercel.app/api/mgm/deposit-callback
- Withdrawal: https://astraven-eight.vercel.app/api/mgm/payout-callback
(These are also sent automatically as notification_url on every order.)
