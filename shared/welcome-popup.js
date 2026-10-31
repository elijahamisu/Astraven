import { getSetting } from './site-settings.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}
function safeUrl(u) {
  const s = String(u || '').trim();
  return /^(https?:\/\/|\/)/i.test(s) ? s : '';
}

const CSS = `
.wp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:3000;display:flex;align-items:center;justify-content:center;padding:18px;animation:wpFade .25s ease}
.wp-box{background:#fff;width:100%;max-width:420px;max-height:90vh;overflow-y:auto;border-radius:20px;border:1.5px solid var(--metallic-gold,#D4AF37);box-shadow:0 20px 60px rgba(0,0,0,.35);position:relative;animation:wpUp .3s ease}
.wp-img{width:100%;display:block;max-height:240px;object-fit:cover;border-radius:18px 18px 0 0}
.wp-body{padding:18px 20px 20px;text-align:center}
.wp-title{font-family:var(--font-heading,serif);font-size:1.35rem;color:var(--deep-forest,#0B2E1F);margin-bottom:10px}
.wp-msg{font-size:.92rem;line-height:1.55;color:var(--primary-text,#1F2937);white-space:pre-wrap;text-align:left;margin-bottom:16px}
.wp-channel{display:flex;align-items:center;justify-content:center;gap:8px;background:#229ED9;color:#fff;font-weight:700;text-decoration:none;padding:13px;border-radius:12px;font-size:.95rem;margin-bottom:10px}
.wp-ok{width:100%;padding:12px;border-radius:12px;border:1px solid var(--metallic-gold,#D4AF37);background:var(--light-gold-bg,#FBF7EC);color:var(--deep-forest,#0B2E1F);font-weight:700;cursor:pointer;font-size:.92rem}
.wp-x{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(0,0,0,.45);color:#fff;font-size:1rem;cursor:pointer}
@keyframes wpFade{from{opacity:0}to{opacity:1}}@keyframes wpUp{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}`;

const TG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>';

export async function showWelcomePopup() {
  let cfg;
  try { cfg = await getSetting('welcome_popup'); } catch { return; }
  if (!cfg || cfg.is_enabled === false) return;
  const img = safeUrl(cfg.image_url);
  const link = safeUrl(cfg.channel_url);
  if (!cfg.title && !cfg.message && !img) return;

  if (!document.getElementById('wpStyles')) {
    const st = document.createElement('style'); st.id = 'wpStyles'; st.textContent = CSS; document.head.appendChild(st);
  }
  const ov = document.createElement('div');
  ov.className = 'wp-overlay';
  ov.innerHTML = `
    <div class="wp-box" role="dialog" aria-modal="true">
      <button class="wp-x" aria-label="Close">✕</button>
      ${img ? `<img class="wp-img" src="${esc(img)}" alt="">` : '<div style="height:40px"></div>'}
      <div class="wp-body">
        ${cfg.title ? `<div class="wp-title">${esc(cfg.title)}</div>` : ''}
        ${cfg.message ? `<div class="wp-msg">${esc(cfg.message)}</div>` : ''}
        ${link ? `<a class="wp-channel" href="${esc(link)}" target="_blank" rel="noopener">${TG}<span>${esc(cfg.channel_label || 'Join Official Channel')}</span></a>` : ''}
        <button class="wp-ok">Continue to Dashboard</button>
      </div>
    </div>`;
  const close = () => ov.remove();
  ov.querySelector('.wp-x').onclick = close;
  ov.querySelector('.wp-ok').onclick = close;
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
  document.body.appendChild(ov);
}
