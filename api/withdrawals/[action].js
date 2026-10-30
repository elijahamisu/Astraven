import request from '../_handlers/withdrawals/request.js';
import review from '../_handlers/withdrawals/review.js';

const routes = {
  'request': request,
  'review': review,
};

// Single serverless function per folder (Vercel Hobby plan allows max 12 functions).
// Public URLs are unchanged: /api/<folder>/<action>.
export default async function handler(req, res) {
  const action = String((req.query && req.query.action) || '').replace(/\.js$/, '');
  const route = Object.prototype.hasOwnProperty.call(routes, action) ? routes[action] : null;
  if (!route) return res.status(404).json({ error: 'Not found' });
  return route(req, res);
}
