import{r,s as o}from"./supabase-client-DdZx35sm.js";import{i as d}from"./user-navigation-mqSLN6Ik.js";import{a as t}from"./formatters-kkpPVsns.js";import"./site-settings-CjsVQood.js";import"./mobile-cards-DX-1T3ZF.js";async function l(){if(await d({requireSession:!0}),!await r())return;const i=new URLSearchParams(window.location.search).get("id"),a=document.getElementById("detailsContainer");if(!i){a.innerHTML='<p style="color: var(--error-red); text-align: center;">No product identifier provided.</p>';return}const{data:e,error:s}=await o.from("products").select("*").eq("id",i).maybeSingle();if(s||!e){a.innerHTML=`
          <div style="text-align: center; padding: 30px;">
            <h2 style="color: var(--error-red); margin-bottom: 8px;">Package Not Found</h2>
            <p style="color: var(--secondary-text); margin-bottom: 16px;">The requested package does not exist or has been archived.</p>
            <a href="vip.html" class="btn-emerald">Browse VIP Packages</a>
          </div>
        `;return}a.innerHTML=`
        <div class="details-top">
          <span class="badge-status ${e.is_active?"badge-completed":"badge-pending"}">
            ${e.is_active?"Available for Investment":"Coming Soon"}
          </span>
          <span style="font-weight: 700; color: var(--metallic-gold); font-size: 0.85rem;">${e.code}</span>
        </div>

        <h1 style="font-size: 1.8rem; color: var(--deep-forest); margin-bottom: 8px;">${e.name}</h1>
        <p style="color: var(--secondary-text); font-size: 0.95rem; line-height: 1.5;">${e.description||"Verified commercial aircraft investment tier."}</p>

        <div class="specs-grid">
          <div class="spec-item">
            <div class="spec-label">Package Cost</div>
            <div class="spec-val" style="color: var(--primary-green);">${t(e.price)}</div>
          </div>
          <div class="spec-item">
            <div class="spec-label">Cycle Duration</div>
            <div class="spec-val">${e.duration_days} Calendar Days</div>
          </div>
          <div class="spec-item">
            <div class="spec-label">Daily Settlement</div>
            <div class="spec-val">${t(e.daily_income)}</div>
          </div>
          <div class="spec-item">
            <div class="spec-label">Total Contract Payout</div>
            <div class="spec-val" style="color: #003D24;">${t(e.total_payout)}</div>
          </div>
        </div>

        <div style="margin-top: 24px;">
          ${e.is_active?`
            <a href="invest.html?product_id=${e.id}" class="btn-gold" style="width: 100%; font-size: 1rem; padding: 14px;">Proceed to Invest</a>
          `:`
            <button class="btn-emerald" disabled style="width: 100%; opacity: 0.6; cursor: not-allowed; padding: 14px;">Package Not Yet Available</button>
          `}
        </div>
      `}l();
