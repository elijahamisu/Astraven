import{s as n,r as c}from"./supabase-client-BCUvSBAr.js";import{i as l}from"./user-navigation-FagTkAhj.js";import{f as m}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";let s=null;async function d(){await l({requireSession:!0});const e=await c();if(!e)return;s=e.user.id;const{data:i,error:r}=await n.from("notifications").select("*").eq("user_id",s).order("created_at",{ascending:!1}).limit(50),a=document.getElementById("notifsContainer");if(r||!i||i.length===0){a.innerHTML=`
          <div class="astra-card" style="text-align: center; padding: 40px;">
            <p style="color: var(--secondary-text);">You have no notifications on file.</p>
          </div>
        `;return}a.innerHTML=i.map(t=>`
        <div class="notif-card-item ${t.is_read?"":"unread"}" id="notif-${t.id}">
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="badge-status ${t.type==="wallet"?"badge-completed":t.type==="security"?"badge-failed":"badge-pending"}" style="font-size: 0.68rem;">
                ${t.type.toUpperCase()}
              </span>
              <strong style="color: var(--deep-forest); font-size: 0.95rem;">${o(t.title)}</strong>
            </div>
            <p style="font-size: 0.88rem; color: var(--primary-text); line-height: 1.45; margin-bottom: 6px;">
              ${o(t.message)}
            </p>
            <span style="font-size: 0.75rem; color: var(--secondary-text);">${m(t.created_at)}</span>
          </div>
          ${t.is_read?"":`
            <button class="btn-emerald" style="padding: 4px 10px; font-size: 0.75rem; white-space: nowrap;" onclick="markRead('${t.id}')">
              Mark Read
            </button>
          `}
        </div>
      `).join("")}window.markRead=async function(e){var r;const{error:i}=await n.from("notifications").update({is_read:!0}).eq("id",e).eq("user_id",s);if(!i){const a=document.getElementById(`notif-${e}`);a&&(a.classList.remove("unread"),(r=a.querySelector("button"))==null||r.remove())}};document.getElementById("markAllBtn").addEventListener("click",async()=>{const{data:e,error:i}=await n.rpc("mark_all_notifications_read",{p_user_id:s});!i&&e.success&&d()});function o(e){return e?e.replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]):""}d();
