import{r as c,s as p}from"./supabase-client-DdZx35sm.js";import{i as l}from"./user-navigation-mqSLN6Ik.js";import{f as d}from"./formatters-kkpPVsns.js";import"./site-settings-CjsVQood.js";import"./mobile-cards-DX-1T3ZF.js";async function m(){if(await l({requireSession:!0}),!await c())return;const{data:t,error:i}=await p.from("announcements").select("*").eq("is_active",!0).order("priority",{ascending:!1}).order("created_at",{ascending:!1}),n=document.getElementById("announcementsList");if(i||!t||t.length===0){n.innerHTML=`
          <div class="astra-card" style="text-align: center; padding: 40px;">
            <p style="color: var(--secondary-text);">No active announcements at this time.</p>
          </div>
        `;return}const s=new Date,o=t.filter(e=>!e.expires_at||new Date(e.expires_at)>s);n.innerHTML=o.map(e=>`
        <div class="notice-card ${e.type||"general"}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="badge-status ${e.type==="urgent"?"badge-failed":e.type==="maintenance"?"badge-pending":"badge-completed"}">
              ${e.category||e.type||"Notice"}
            </span>
            <span style="font-size: 0.75rem; color: var(--secondary-text);">${d(e.created_at)}</span>
          </div>

          <h2 style="font-size: 1.2rem; color: var(--deep-forest); margin-bottom: 8px;">${r(e.title)}</h2>
          <p style="font-size: 0.9rem; color: var(--primary-text); line-height: 1.5; white-space: pre-wrap;">${r(e.content)}</p>
        </div>
      `).join("")}function r(a){return a?a.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}m();
