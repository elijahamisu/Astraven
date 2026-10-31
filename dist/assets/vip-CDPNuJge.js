import{r as m,s as n}from"./supabase-client-BCUvSBAr.js";import{i as p}from"./user-navigation-FagTkAhj.js";import{a as i}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";let s=[];async function g(){if(await p({requireSession:!0}),!await m())return;const{data:t}=await n.from("product_categories").select("id").eq("slug","vip").single();if(!t)return;const{data:e,error:l}=await n.from("products").select("*").eq("category_id",t.id).is("archived_at",null).order("price",{ascending:!0}),o=document.getElementById("productsContainer");if(l||!e||e.length===0){o.innerHTML=`
          <div class="astra-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <p style="color: var(--secondary-text);">No VIP packages available at this time.</p>
          </div>
        `;return}s=e,c(s),document.getElementById("searchInput").addEventListener("input",v=>{const r=v.target.value.toLowerCase().trim(),u=s.filter(d=>d.name.toLowerCase().includes(r)||d.code.toLowerCase().includes(r));c(u)})}function c(a){const t=document.getElementById("productsContainer");if(a.length===0){t.innerHTML='<div class="astra-card" style="grid-column: 1 / -1; text-align: center; padding: 30px;"><p style="color: var(--secondary-text);">No packages match your search.</p></div>';return}t.innerHTML=a.map(e=>`
        <div class="product-card ${e.is_active?"":"inactive"}">
          <div>
            <div class="card-top">
              <span class="vip-tag">${e.code}</span>
              <span class="badge-status ${e.is_active?"badge-completed":"badge-pending"}">
                ${e.is_active?"Active":"Coming Soon"}
              </span>
            </div>
            <h2 class="prod-name">${e.name}</h2>
            <div class="price-tag">${i(e.price)}</div>

            <div class="terms-grid">
              <div>
                <div class="term-label">Cycle Duration</div>
                <div class="term-value">${e.duration_days} Days</div>
              </div>
              <div>
                <div class="term-label">Daily Settlement</div>
                <div class="term-value" style="color: var(--bright-gold);">${i(e.daily_income)}</div>
              </div>
              <div>
                <div class="term-label">Total Revenue</div>
                <div class="term-value">${i(e.total_payout)}</div>
              </div>
              <div>
                <div class="term-label">Return Yield</div>
                <div class="term-value" style="color: var(--success-green);">+${Math.round((e.total_payout-e.price)/e.price*100)}%</div>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <a href="vip-details.html?id=${e.id}" class="btn-emerald" style="flex: 1; padding: 10px;">Details</a>
            ${e.is_active?`
              <a href="invest.html?product_id=${e.id}" class="btn-gold" style="flex: 1; padding: 10px;">Invest</a>
            `:`
              <button class="btn-emerald" disabled style="flex: 1; padding: 10px; opacity: 0.5; cursor: not-allowed;">Closed</button>
            `}
          </div>
        </div>
      `).join("")}g();
