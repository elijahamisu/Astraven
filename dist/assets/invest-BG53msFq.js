import{r as f,s as m}from"./supabase-client-BCUvSBAr.js";import{i as g}from"./user-navigation-C7tDwe5x.js";import{a}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-1MPb4jkf.js";import"./mobile-cards-DX-1T3ZF.js";let i=null,p=null;async function v(){if(await g({requireSession:!0}),i=await f(),!i)return;const r=new URLSearchParams(window.location.search).get("product_id"),o=document.getElementById("purchaseCard");if(!r){o.innerHTML='<p style="color: var(--error-red);">Missing product identifier. Return to catalog.</p>';return}const{data:e,error:s}=await m.from("products").select("*").eq("id",r).maybeSingle();if(s||!e||!e.is_active){o.innerHTML='<p style="color: var(--error-red);">Package unavailable or closed.</p>';return}p=e;const{data:t}=await m.from("wallets").select("balance").eq("user_id",i.user.id).single(),l=Number((t==null?void 0:t.balance)||0)>=Number(e.price),u=Number((t==null?void 0:t.balance)||0)-Number(e.price);if(o.innerHTML=`
        <div style="border-bottom: 1px solid #ECECEC; padding-bottom: 14px; margin-bottom: 14px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--metallic-gold);">${e.code}</span>
          <h2 style="font-size: 1.4rem; color: var(--deep-forest); margin-top: 2px;">${e.name}</h2>
          <div style="font-size: 1.8rem; font-family: var(--font-heading); color: var(--primary-green); font-weight: 700;">
            ${a(e.price)}
          </div>
        </div>

        <div class="balance-check-box">
          <div class="calc-row">
            <span style="color: var(--secondary-text);">Available Wallet Balance:</span>
            <strong>${a((t==null?void 0:t.balance)||0)}</strong>
          </div>
          <div class="calc-row">
            <span style="color: var(--secondary-text);">Investment Purchase Price:</span>
            <strong style="color: var(--error-red);">- ${a(e.price)}</strong>
          </div>
          <div class="calc-row" style="border-top: 1px solid #CBD5E1; padding-top: 8px; margin-top: 8px;">
            <span>Projected Balance After:</span>
            <strong style="color: ${l?"var(--deep-forest)":"var(--error-red)"};">
              ${a(Math.max(0,u))}
            </strong>
          </div>
        </div>

        ${l?`
          <div style="margin-bottom: 18px;">
            <label style="display: flex; gap: 8px; align-items: flex-start; cursor: pointer; font-size: 0.85rem; color: var(--primary-text);">
              <input type="checkbox" id="termsCheck" style="margin-top: 3px;">
              <span>I confirm and authorize the deduction of ${a(e.price)} from my available balance for the ${e.name} contract.</span>
            </label>
          </div>

          <button id="confirmBtn" class="btn-gold" style="width: 100%; padding: 14px;" disabled>
            Execute Investment
          </button>
        `:`
          <div style="background: #FFF4D9; border: 1px solid var(--pending-orange); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 0.85rem; color: #8A5B00;">
            ⚠️ Insufficient balance to activate this package. Please deposit at least ${a(e.price-((t==null?void 0:t.balance)||0))} to proceed.
          </div>
          <a href="deposit.html" class="btn-gold" style="width: 100%; margin-bottom: 8px;">Deposit Funds Now</a>
        `}
      `,l){const c=document.getElementById("termsCheck"),d=document.getElementById("confirmBtn");c==null||c.addEventListener("change",()=>{d.disabled=!c.checked}),d==null||d.addEventListener("click",b)}}async function b(){const n=document.getElementById("confirmBtn"),r=document.getElementById("alertBanner");r.style.display="none",n.disabled=!0,n.textContent="Processing Transaction...";const o="INV-REQ-"+i.user.id.substring(0,8)+"-"+p.id.substring(0,8)+"-"+Date.now();try{const s=await(await fetch("/api/investments/purchase",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${i.access_token}`},body:JSON.stringify({productId:p.id,idempotencyKey:o})})).json();if(!s.success){r.textContent=s.error||"Investment purchase failed.",r.className="alert-banner error",n.disabled=!1,n.textContent="Execute Investment";return}r.textContent="Investment successfully activated! Redirecting to portfolio...",r.className="alert-banner success",setTimeout(()=>{window.location.href=`investment-details.html?id=${s.investment_id}`},1500)}catch{r.textContent="Network or processor timeout. Please check your portfolio.",r.className="alert-banner error",n.disabled=!1,n.textContent="Execute Investment"}}v();
