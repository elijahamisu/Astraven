// Live site settings (deposit_config, withdrawal_config, referral_config).
// Reads from Supabase and subscribes to Realtime so admin changes show up
// on open pages immediately, without a refresh.
//
// Any element with data-setting="<key>.<field>" is filled automatically,
// e.g. <span data-setting="referral_config.commission_rate">10</span>.
import { supabase } from './supabase-client.js';

const cache = {};
const listeners = {};
let channel = null;

function emit(key) {
  (listeners[key] || []).forEach((cb) => { try { cb(cache[key] || {}); } catch (e) { console.error(e); } });
  bindElements();
}

function fmtNumber(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString('en-NG', { maximumFractionDigits: 2 }) : '';
}

function bindElements(root = document) {
  root.querySelectorAll('[data-setting]').forEach((el) => {
    const [key, field] = el.dataset.setting.split('.');
    const cfg = cache[key];
    if (!cfg || cfg[field] === undefined || cfg[field] === null) return;
    el.textContent = el.dataset.format === 'money' ? '₦' + fmtNumber(cfg[field]) : fmtNumber(cfg[field]);
  });
}

function ensureChannel() {
  if (channel || !supabase) return;
  channel = supabase
    .channel('site-settings-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
      const row = payload.new && payload.new.key ? payload.new : null;
      if (!row) return;
      cache[row.key] = row.value || {};
      emit(row.key);
    })
    .subscribe();
}

export async function loadSettings(keys = ['deposit_config', 'withdrawal_config', 'referral_config']) {
  if (!supabase) return cache;
  const { data } = await supabase.from('site_settings').select('key, value').in('key', keys);
  (data || []).forEach((row) => { cache[row.key] = row.value || {}; });
  keys.forEach((k) => emit(k));
  ensureChannel();
  return cache;
}

export async function getSetting(key) {
  if (!(key in cache)) await loadSettings([key]);
  return cache[key] || {};
}

// Calls cb(config) now and again every time an admin changes that setting.
export async function watchSetting(key, cb) {
  (listeners[key] = listeners[key] || []).push(cb);
  const cfg = await getSetting(key);
  ensureChannel();
  cb(cfg);
  return () => { listeners[key] = (listeners[key] || []).filter((f) => f !== cb); };
}

if (typeof window !== 'undefined' && !window.__siteSettingsInit) {
  window.__siteSettingsInit = true;
  const start = () => { if (document.querySelector('[data-setting]')) loadSettings(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}
