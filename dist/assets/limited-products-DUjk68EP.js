import{r as c,s}from"./supabase-client-BCUvSBAr.js";import{i as o}from"./user-navigation-CnUP_QeE.js";import{a as d}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";async function l(){if(await o({requireSession:!0}),!await c())return;const{data:i}=await s.from("product_categories").select("id").eq("slug","limited").single();if(!i)return;const{data:e}=await s.from("products").select("*").eq("category_id",i.id).is("archived_at",null).order("created_at",{ascending:!1}),r=document.getElementById("limitedContainer");if(!e||e.length===0){r.innerHTML='<div class="astra-card" style="grid-column: 1 / -1; text-align: center; padding: 30px;">No limited-capacity flight products available.</div>';return}r.innerHTML=e.map(t=>{const a=t.max_capacity&&t.current_capacity>=t.max_capacity,n=t.max_capacity?Math.min(100,Math.round(t.current_capacity/t.max_capacity*100)):0;return`
          <div class="astra-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 700; font-size: 0.75rem; color: var(--primary-green);">${t.code}</span>
              <span class="badge-status ${a?"badge-failed":"badge-completed"}">
                ${a?"Sold Out":"Slots Open"}
              </span>
            </div>

            <h2 style="font-size: 1.25rem; color: var(--deep-forest); margin-bottom: 4px;">${t.name}</h2>
            <div style="font-size: 1.5rem; font-family: var(--font-heading); font-weight: 700; color: var(--primary-green); margin-bottom: 12px;">
              ${d(t.price)}
            </div>

            <div style="font-size: 0.85rem; margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; color: var(--secondary-text); font-size: 0.8rem;">
                <span>Quota Reserved</span>
                <strong>${t.current_capacity} / ${t.max_capacity||"∞"} Seats</strong>
              </div>
              <div class="capacity-bar-wrap">
                <div class="capacity-bar-fill" style="width: ${n}%; background: ${a?"var(--error-red)":"var(--metallic-gold)"};"></div>
              </div>
            </div>

            <div>
              ${a?`
                <button class="btn-emerald" disabled style="width: 100%; opacity: 0.6; cursor: not-allowed;">Product has reached its maximum capacity.</button>
              `:`
                <a href="invest.html?product_id=${t.id}" class="btn-gold" style="width: 100%;">Reserve Capacity</a>
              `}
            </div>
          </div>
        `}).join("")}l();
