import { createClient } from '@supabase/supabase-js';

// In-tab auth lock. The default browser (navigator.locks) lock can hang forever
// on some Android browsers right after sign-up / sign-in, which froze pages.
const authLocks = new Map();
async function inTabLock(name, _acquireTimeout, fn) {
  const previous = authLocks.get(name) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  const chained = previous.then(() => current);
  authLocks.set(name, chained);
  await previous.catch(() => {});
  try {
    return await fn();
  } finally {
    release();
    if (authLocks.get(name) === chained) authLocks.delete(name);
  }
}

const SUPABASE_URL = (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) 
  || import.meta.env?.VITE_SUPABASE_URL 
  || '';

const SUPABASE_ANON_KEY = (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) 
  || import.meta.env?.VITE_SUPABASE_ANON_KEY 
  || '';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, lock: inTabLock }
    })
  : null;

export async function requireAuth(redirectUrl = 'login.html') {
  if (!supabase) {
    console.error('Supabase client is not configured.');
    return null;
  }
  let result;
  try {
    result = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('session-timeout')), 12000))
    ]);
  } catch (e) {
    // Session check stalled: reload once, then fall back to login.
    if (!sessionStorage.getItem('astra_auth_retry')) {
      sessionStorage.setItem('astra_auth_retry', '1');
      window.location.reload();
      return null;
    }
    sessionStorage.removeItem('astra_auth_retry');
    result = { data: { session: null }, error: e };
  }
  sessionStorage.removeItem('astra_auth_retry');
  const { data: { session }, error } = result;
  if (error || !session) {
    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${redirectUrl}?redirect=${currentPath}`;
    return null;
  }
  return session;
}

export async function signOutUser() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  window.location.href = 'login.html';
}
