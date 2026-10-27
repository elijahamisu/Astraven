import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing bearer token.' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ success: false, error: 'Server configuration error.' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Authenticate user via token
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid.' });
  }

  const { productId, idempotencyKey } = req.body || {};

  if (!productId) {
    return res.status(400).json({ success: false, error: 'Product ID is required.' });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('execute_investment_purchase', {
      p_user_id: user.id,
      p_product_id: productId,
      p_idempotency_key: idempotencyKey || null
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    if (!data.success) {
      return res.status(400).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Purchase invocation failed:', err);
    return res.status(500).json({ success: false, error: 'Internal purchase processor error.' });
  }
}
