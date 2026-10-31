import{r as b,s as y}from"./supabase-client-DdZx35sm.js";import{i as $}from"./user-navigation-mqSLN6Ik.js";import{a as i}from"./formatters-kkpPVsns.js";import"./site-settings-CjsVQood.js";import"./mobile-cards-DX-1T3ZF.js";async function x(){if(await $({requireSession:!0}),!await b())return;const{data:o}=await y.from("product_categories").select("id").eq("slug","limited").single();if(!o)return;const{data:r}=await y.from("products").select("*").eq("category_id",o.id).is("archived_at",null).order("created_at",{ascending:!1}),c=document.getElementById("limitedContainer");if(!r||r.length===0){c.innerHTML='<div class="astra-card" style="grid-column: 1 / -1; text-align: center; padding: 30px;">No limited-capacity flight products available.</div>';return}c.innerHTML=r.map(t=>{const a=t.max_capacity&&t.current_capacity>=t.max_capacity,u=t.max_capacity?Math.min(100,Math.round(t.current_capacity/t.max_capacity*100)):0;return`
          <div class="astra-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 700; font-size: 0.75rem; color: var(--primary-green);">${t.code}</span>
              <span class="badge-status ${a?"badge-failed":"badge-completed"}">
                ${a?"Sold Out":"Slots Open"}
              </span>
            </div>

            <h2 style="font-size: 1.25rem; color: var(--deep-forest); margin-bottom: 4px;">${t.name}</h2>
            <div style="font-size: 1.5rem; font-family: var(--font-heading); font-weight: 700; color: var(--primary-green); margin-bottom: 12px;">
              ${i(t.price)}
            </div>

            ${(()=>{const s=Number(t.price)||0,l=Number(t.total_payout)||0,d=l-s,m=Number(t.duration_days)||0,n=Number(t.daily_income)||0,p=s>0?Math.round(d/s*100):0,e=(g,v,f="var(--deep-forest)")=>`
                <div style="background: rgba(0,0,0,0.03); border-radius: 10px; padding: 10px;">
                  <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--secondary-text);">${g}</div>
                  <div style="font-weight: 700; font-size: 0.95rem; color: ${f}; margin-top: 2px;">${v}</div>
                </div>`;return`
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
                  ${e("Duration",`${m} Day${m===1?"":"s"}`)}
                  ${e(t.payout_type==="maturity"||n<=0?"Payout":"Daily Income",t.payout_type==="maturity"||n<=0?"At maturity":i(n),"var(--metallic-gold)")}
                  ${e("Total Return",i(l))}
                  ${e("Profit",`+${i(d)} (${p}%)`,"var(--success-green)")}
                </div>`})()}

            <div style="font-size: 0.85rem; margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; color: var(--secondary-text); font-size: 0.8rem;">
                <span>Quota Reserved</span>
                <strong>${t.current_capacity} / ${t.max_capacity||"∞"} Seats</strong>
              </div>
              <div class="capacity-bar-wrap">
                <div class="capacity-bar-fill" style="width: ${u}%; background: ${a?"var(--error-red)":"var(--metallic-gold)"};"></div>
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
        `}).join("")}x();
