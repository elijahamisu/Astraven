import{r as m,s as d}from"./supabase-client-DdZx35sm.js";import{i as u}from"./user-navigation-mqSLN6Ik.js";import{a as s,f as g}from"./formatters-kkpPVsns.js";import{g as f}from"./site-settings-CjsVQood.js";import"./mobile-cards-DX-1T3ZF.js";function l(e){return String(e??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n])}function p(e){const n=String(e||"").trim();return/^(https?:\/\/|\/)/i.test(n)?n:""}const w=`
.wp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:3000;display:flex;align-items:center;justify-content:center;padding:18px;animation:wpFade .25s ease}
.wp-box{background:#fff;width:100%;max-width:420px;max-height:90vh;overflow-y:auto;border-radius:20px;border:1.5px solid var(--metallic-gold,#D4AF37);box-shadow:0 20px 60px rgba(0,0,0,.35);position:relative;animation:wpUp .3s ease}
.wp-img{width:100%;display:block;max-height:240px;object-fit:cover;border-radius:18px 18px 0 0}
.wp-body{padding:18px 20px 20px;text-align:center}
.wp-title{font-family:var(--font-heading,serif);font-size:1.35rem;color:var(--deep-forest,#0B2E1F);margin-bottom:10px}
.wp-msg{font-size:.92rem;line-height:1.55;color:var(--primary-text,#1F2937);white-space:pre-wrap;text-align:left;margin-bottom:16px}
.wp-channel{display:flex;align-items:center;justify-content:center;gap:8px;background:#229ED9;color:#fff;font-weight:700;text-decoration:none;padding:13px;border-radius:12px;font-size:.95rem;margin-bottom:10px}
.wp-ok{width:100%;padding:12px;border-radius:12px;border:1px solid var(--metallic-gold,#D4AF37);background:var(--light-gold-bg,#FBF7EC);color:var(--deep-forest,#0B2E1F);font-weight:700;cursor:pointer;font-size:.92rem}
.wp-x{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(0,0,0,.45);color:#fff;font-size:1rem;cursor:pointer}
@keyframes wpFade{from{opacity:0}to{opacity:1}}@keyframes wpUp{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}`,h='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>';async function y(){let e;try{e=await f("welcome_popup")}catch{return}if(!e||e.is_enabled===!1)return;const n=p(e.image_url),r=p(e.channel_url);if(!e.title&&!e.message&&!n)return;if(!document.getElementById("wpStyles")){const a=document.createElement("style");a.id="wpStyles",a.textContent=w,document.head.appendChild(a)}const t=document.createElement("div");t.className="wp-overlay",t.innerHTML=`
    <div class="wp-box" role="dialog" aria-modal="true">
      <button class="wp-x" aria-label="Close">✕</button>
      ${n?`<img class="wp-img" src="${l(n)}" alt="">`:'<div style="height:40px"></div>'}
      <div class="wp-body">
        ${e.title?`<div class="wp-title">${l(e.title)}</div>`:""}
        ${e.message?`<div class="wp-msg">${l(e.message)}</div>`:""}
        ${r?`<a class="wp-channel" href="${l(r)}" target="_blank" rel="noopener">${h}<span>${l(e.channel_label||"Join Official Channel")}</span></a>`:""}
        <button class="wp-ok">Continue to Dashboard</button>
      </div>
    </div>`;const i=()=>t.remove();t.querySelector(".wp-x").onclick=i,t.querySelector(".wp-ok").onclick=i,t.addEventListener("click",a=>{a.target===t&&i()}),document.body.appendChild(t)}async function b(){var c;await u({requireSession:!0});const e=await m();if(!e)return;const n=e.user.id,{data:r}=await d.from("profiles").select("full_name, username, referral_code").eq("id",n).maybeSingle();if(r){const o=r.full_name||r.username||"Investor";document.getElementById("welcomeUser").textContent=`Welcome, ${o}`,r.referral_code&&(document.getElementById("refLinkInput").value=`${window.location.origin}/register.html?ref=${r.referral_code}`)}const{data:t}=await d.from("wallets").select("balance, reserved_balance, total_deposited, total_withdrawn").eq("user_id",n).maybeSingle();t&&(document.getElementById("walletBalance").textContent=s(t.balance),document.getElementById("reservedBalance").textContent=s(t.reserved_balance),document.getElementById("totalDeposited").textContent=s(t.total_deposited),document.getElementById("totalWithdrawn").textContent=s(t.total_withdrawn));const{data:i}=await d.from("transactions").select("type, amount, status, created_at").eq("user_id",n).order("created_at",{ascending:!1}).limit(5);i&&i.length>0&&(document.getElementById("txLedgerContainer").innerHTML=`
          <table class="tx-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${i.map(o=>`
                <tr>
                  <td style="font-weight: 600; text-transform: capitalize;">${o.type.replace(/_/g," ")}</td>
                  <td style="color: ${Number(o.amount)>=0?"var(--success-green)":"var(--error-red)"}; font-weight: 700;">
                    ${s(o.amount)}
                  </td>
                  <td>
                    <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:${o.status==="completed"?"var(--success-green)":o.status==="pending"?"var(--pending-orange)":"var(--error-red)"};">
                      ${o.status}
                    </span>
                  </td>
                  <td style="color: var(--secondary-text); font-size: 0.8rem;">${g(o.created_at)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `);const{data:a}=await d.from("announcements").select("title, content").eq("is_active",!0).order("priority",{ascending:!1}).limit(1);a&&a.length>0&&(document.getElementById("announcementTitle").textContent=`✦ ${a[0].title}`,document.getElementById("announcementContent").textContent=a[0].content,document.getElementById("announcementBox").style.display="block"),(c=document.getElementById("copyRefBtn"))==null||c.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("refLinkInput").value),alert("ASTRAVEN referral link copied to clipboard!")})}y();b();
