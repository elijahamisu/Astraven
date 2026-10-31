import{r as c,s as l}from"./supabase-client-BCUvSBAr.js";import{i as f}from"./user-navigation-FagTkAhj.js";import{a as m,f as v}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";let a=[];async function p(){await f({requireSession:!0});const r=await c();if(!r)return;const{data:t,error:e}=await l.from("deposits").select("*").eq("user_id",r.user.id).order("created_at",{ascending:!1}),d=document.getElementById("historyList");if(e||!t||t.length===0){d.innerHTML=`
          <div class="astra-card" style="text-align: center; padding: 40px;">
            <p style="color: var(--secondary-text); margin-bottom: 12px;">No deposit requests found.</p>
            <a href="deposit.html" class="btn-gold">Make a Deposit</a>
          </div>
        `;return}a=t,o(a),document.querySelectorAll(".filter-btn").forEach(s=>{s.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(i=>i.classList.remove("active")),s.classList.add("active");const n=s.dataset.filter;o(n==="all"?a:a.filter(i=>i.status===n))})})}function o(r){const t=document.getElementById("historyList");if(r.length===0){t.innerHTML='<div class="astra-card" style="text-align: center; padding: 30px; color: var(--secondary-text);">No deposits match this filter.</div>';return}t.innerHTML=r.map(e=>`
        <div class="dep-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-family: monospace; font-size: 0.82rem; font-weight: 700; color: var(--deep-forest);">${e.reference}</span>
            <span class="badge-status ${e.status==="approved"?"badge-completed":e.status==="pending"?"badge-pending":"badge-failed"}">
              ${e.status}
            </span>
          </div>

          <div style="font-size: 1.4rem; font-family: var(--font-heading); color: var(--primary-green); font-weight: 700; margin-bottom: 6px;">
            ${m(e.amount)}
          </div>

          <div style="font-size: 0.82rem; color: var(--secondary-text); line-height: 1.4;">
            <div>Sender: <strong>${e.sender_name||"—"}</strong></div>
            <div>Ref: <strong>${e.transfer_reference||"—"}</strong></div>
            <div>Date: ${v(e.created_at)}</div>
            ${e.status==="rejected"&&e.rejection_reason?`
              <div style="color: var(--error-red); margin-top: 4px;">Reason: ${e.rejection_reason}</div>
            `:""}
          </div>
        </div>
      `).join("")}p();
