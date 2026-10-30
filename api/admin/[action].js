import gatewayBalance from '../_handlers/admin/gateway-balance.js';
import grantProduct from '../_handlers/admin/grant-product.js';
import updateSettings from '../_handlers/admin/update-settings.js';
import walletAdjustment from '../_handlers/admin/wallet-adjustment.js';

const routes = {
  'gateway-balance': gatewayBalance,
  'grant-product': grantProduct,
  'update-settings': updateSettings,
  'wallet-adjustment': walletAdjustment,
};

// Single serverless function per folder (Vercel Hobby plan allows max 12 functions).
// Public URLs are unchanged: /api/<folder>/<action>.
export default async function handler(req, res) {
  const action = String((req.query && req.query.action) || '').replace(/\.js$/, '');
  const route = Object.prototype.hasOwnProperty.call(routes, action) ? routes[action] : null;
  if (!route) return res.status(404).json({ error: 'Not found' });
  return route(req, res);
}
