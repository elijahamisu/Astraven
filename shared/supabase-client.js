import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm';

const SUPABASE_URL = (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) 
  || import.meta.env?.VITE_SUPABASE_URL 
  || '';

const SUPABASE_ANON_KEY = (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) 
  || import.meta.env?.VITE_SUPABASE_ANON_KEY 
  || '';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export async function requireAuth(redirectUrl = 'login.html') {
  if (!supabase) {
    console.error('Supabase client is not configured.');
    return null;
  }
  const { data: { session }, error } = await supabase.auth.getSession();
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
