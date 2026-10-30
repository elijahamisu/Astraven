import { supabase } from './supabase-client.js';

// Returns a Map of user id -> username for any users (RLS-safe: usernames only).
export async function fetchUsernames(ids) {
  const unique = [...new Set((ids || []).filter(Boolean))];
  if (!unique.length) return new Map();
  const { data } = await supabase.rpc('get_public_usernames', { p_user_ids: unique });
  return new Map((data || []).map(r => [r.id, r.username]));
}
