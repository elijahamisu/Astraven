import{r as l,s as c}from"./supabase-client-DdZx35sm.js";import{i as p}from"./user-navigation-mqSLN6Ik.js";import{a as i,f as m}from"./formatters-kkpPVsns.js";import"./site-settings-CjsVQood.js";import"./mobile-cards-DX-1T3ZF.js";let o=[];async function v(){await p({requireSession:!0});const a=await l();if(!a)return;const{data:t,error:s}=await c.from("investments").select("*").eq("user_id",a.user.id).order("created_at",{ascending:!1}),e=document.getElementById("invContainer");if(s||!t||t.length===0){e.innerHTML=`
          <div class="astra-card" style="text-align: center; padding: 48px 16px;">
            <div style="font-size: 2.4rem; margin-bottom: 10px; opacity: 0.6;">🛫</div>
            <h3 style="margin-bottom: 6px;">No Active Investments Found</h3>
            <p style="color: var(--secondary-text); font-size: 0.9rem; margin-bottom: 18px;">
              You do not currently possess any active flight revenue packages.
            </p>
            <a href="vip.html" class="btn-gold">Explore ASTRA-VIP Packages</a>
          </div>
        `;return}o=t,n("all"),document.querySelectorAll(".filter-btn").forEach(r=>{r.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(d=>d.classList.remove("active")),r.classList.add("active"),n(r.dataset.filter)})})}function n(a){const t=document.getElementById("invContainer"),s=o.filter(e=>a==="all"||e.status===a);if(s.length===0){t.innerHTML='<div class="astra-card" style="text-align: center; padding: 30px;"><p style="color: var(--secondary-text);">No investments found for selected filter.</p></div>';return}t.innerHTML=s.map(e=>`
        <div class="inv-item-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div>
              <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--metallic-gold); font-weight: 700;">${e.category_slug.toUpperCase()}</span>
              <h3 style="font-size: 1.15rem; color: var(--deep-forest);">${e.product_name}</h3>
            </div>
            <span class="badge-status ${e.status==="active"?"badge-completed":"badge-pending"}">
              ${e.status}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 0.85rem; margin-bottom: 14px; background: var(--light-gold-bg); padding: 10px; border-radius: var(--radius-sm);">
            <div>
              <span style="color: var(--secondary-text); font-size: 0.75rem;">Invested Capital:</span>
              <div style="font-weight: 700; color: var(--deep-forest);">${i(e.purchase_price)}</div>
            </div>
            <div>
              <span style="color: var(--secondary-text); font-size: 0.75rem;">Total Expected:</span>
              <div style="font-weight: 700; color: var(--primary-green);">${i(e.total_payout)}</div>
            </div>
            <div>
              <span style="color: var(--secondary-text); font-size: 0.75rem;">Maturity Date:</span>
              <div style="font-weight: 600;">${m(e.maturity_date,{includeTime:!1})}</div>
            </div>
            <div>
              <span style="color: var(--secondary-text); font-size: 0.75rem;">Payouts Credited:</span>
              <div style="font-weight: 700; color: var(--success-green);">${i(e.total_paid_out)}</div>
            </div>
          </div>

          <div style="text-align: right;">
            <a href="investment-details.html?id=${e.id}" class="btn-emerald" style="padding: 8px 16px; font-size: 0.82rem;">View Full Details →</a>
          </div>
        </div>
      `).join("")}v();
