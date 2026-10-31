import{r,s as n}from"./supabase-client-BCUvSBAr.js";import{i as o}from"./user-navigation-C7tDwe5x.js";import{a as e}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-1MPb4jkf.js";import"./mobile-cards-DX-1T3ZF.js";async function c(){if(await o({requireSession:!0}),!await r())return;const{data:s}=await n.from("product_categories").select("id").eq("slug","ssvip").single();if(!s)return;const{data:a}=await n.from("products").select("*").eq("category_id",s.id).is("archived_at",null).order("price",{ascending:!0}),i=document.getElementById("ssvipContainer");if(!a||a.length===0){i.innerHTML='<div class="astra-card" style="grid-column: 1 / -1; text-align: center; padding: 30px;">No SSVIP packages active.</div>';return}i.innerHTML=a.map(t=>`
        <div class="astra-card-signature" style="margin-bottom: 0;">
          <div class="card-signature-content">
            <div class="signature-top-row">
              <span class="signature-brand-tag">${t.code}</span>
              <span class="badge-status ${t.is_active?"badge-completed":"badge-pending"}">${t.is_active?"Open":"Coming Soon"}</span>
            </div>

            <h2 style="font-size: 1.4rem; color: var(--white); margin-bottom: 6px;">${t.name}</h2>
            <div style="font-size: 1.7rem; font-family: var(--font-heading); color: var(--bright-gold); margin-bottom: 14px;">
              ${e(t.price)}
            </div>

            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 0.85rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: var(--secondary-text);">Maturity Term:</span>
                <strong>${t.duration_days} Days</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: var(--secondary-text);">Total Payout at Maturity:</span>
                <strong style="color: var(--bright-gold);">${e(t.total_payout)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--secondary-text);">Net Growth:</span>
                <strong style="color: var(--success-green);">+${e(t.total_payout-t.price)}</strong>
              </div>
            </div>

            <div>
              ${t.is_active?`
                <a href="invest.html?product_id=${t.id}" class="btn-gold" style="width: 100%;">Invest Now</a>
              `:`
                <button class="btn-emerald" disabled style="width: 100%; opacity: 0.5;">Coming Soon</button>
              `}
            </div>
          </div>
        </div>
      `).join("")}c();
