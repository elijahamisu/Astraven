import{r as l,s as m}from"./supabase-client-BCUvSBAr.js";import{i as f}from"./user-navigation-FagTkAhj.js";import{a as o,f as v}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";let r=[];async function p(){await f({requireSession:!0});const a=await l();if(!a)return;const{data:t,error:e}=await m.from("withdrawals").select("*").eq("user_id",a.user.id).order("created_at",{ascending:!1}),i=document.getElementById("withList");if(e||!t||t.length===0){i.innerHTML=`
          <div class="astra-card" style="text-align: center; padding: 40px;">
            <p style="color: var(--secondary-text); margin-bottom: 12px;">No withdrawal requests recorded.</p>
            <a href="withdraw.html" class="btn-gold">Request Withdrawal</a>
          </div>
        `;return}r=t,c(r),document.querySelectorAll(".filter-btn").forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(s=>s.classList.remove("active")),n.classList.add("active");const d=n.dataset.filter;c(d==="all"?r:r.filter(s=>s.status===d))})})}function c(a){const t=document.getElementById("withList");if(a.length===0){t.innerHTML='<div class="astra-card" style="text-align: center; padding: 30px; color: var(--secondary-text);">No withdrawals found for this filter.</div>';return}t.innerHTML=a.map(e=>{const i=e.account_number?"••••••"+e.account_number.slice(-4):"••••";return`
          <div class="with-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-family: monospace; font-size: 0.82rem; font-weight: 700; color: var(--deep-forest);">${e.reference}</span>
              <span class="badge-status ${e.status==="paid"?"badge-completed":e.status==="pending"?"badge-pending":"badge-failed"}">
                ${e.status}
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
              <div>
                <span style="font-size: 0.72rem; color: var(--secondary-text);">NET PAYOUT:</span>
                <div style="font-size: 1.35rem; font-family: var(--font-heading); color: var(--primary-green); font-weight: 700;">
                  ${o(e.net_amount)}
                </div>
              </div>
              <div style="text-align: right; font-size: 0.82rem; color: var(--secondary-text);">
                Gross: ${o(e.amount)} | Fee: ${o(e.fee)}
              </div>
            </div>

            <div style="font-size: 0.82rem; color: var(--secondary-text); background: var(--light-gold-bg); padding: 8px 12px; border-radius: var(--radius-sm);">
              <div>Bank: <strong>${e.bank_name} (${i})</strong></div>
              <div>Name: <strong>${e.account_name}</strong></div>
              <div>Date: ${v(e.created_at)}</div>
              ${e.status==="rejected"&&e.rejection_reason?`
                <div style="color: var(--error-red); margin-top: 4px;">Reason: ${e.rejection_reason}</div>
              `:""}
              ${e.payment_reference?`
                <div style="color: var(--success-green); margin-top: 4px;">Bank Ref: ${e.payment_reference}</div>
              `:""}
            </div>
          </div>
        `}).join("")}p();
