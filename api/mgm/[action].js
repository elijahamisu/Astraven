import depositCallback from '../_handlers/mgm/deposit-callback.js';
import payoutCallback from '../_handlers/mgm/payout-callback.js';

const routes = {
  'deposit-callback': depositCallback,
  'payout-callback': payoutCallback,
};

// Single serverless function per folder (Vercel Hobby plan allows max 12 functions).
// Public URLs are unchanged: /api/<folder>/<action>.
export default async function handler(req, res) {
  const action = String((req.query && req.query.action) || '').replace(/\.js$/, '');
  const route = Object.prototype.hasOwnProperty.call(routes, action) ? routes[action] : null;
  if (!route) return res.status(404).json({ error: 'Not found' });
  return route(req, res);
}
