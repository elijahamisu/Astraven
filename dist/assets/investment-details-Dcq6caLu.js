import{r as c,s as d}from"./supabase-client-BCUvSBAr.js";import{i as v}from"./user-navigation-C7tDwe5x.js";import{a as e,f as a}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-1MPb4jkf.js";import"./mobile-cards-DX-1T3ZF.js";async function p(){await v({requireSession:!0});const i=await c();if(!i)return;const n=new URLSearchParams(window.location.search).get("id"),s=document.getElementById("contentCard");if(!n){s.innerHTML='<p style="color: var(--error-red);">No investment identifier specified.</p>';return}const{data:t,error:l}=await d.from("investments").select("*").eq("id",n).eq("user_id",i.user.id).maybeSingle();if(l||!t){s.innerHTML=`
          <div style="text-align: center; padding: 24px;">
            <h2 style="color: var(--error-red); margin-bottom: 8px;">Record Not Accessible</h2>
            <p style="color: var(--secondary-text); font-size: 0.9rem;">You do not possess permission to view this investment.</p>
          </div>
        `;return}const{data:o}=await d.from("investment_payouts").select("*").eq("investment_id",t.id).order("payout_date",{ascending:!1});s.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ECECEC; padding-bottom: 12px; margin-bottom: 16px;">
          <span class="badge-status ${t.status==="active"?"badge-completed":"badge-pending"}">${t.status.toUpperCase()}</span>
          <span style="font-size: 0.75rem; color: var(--secondary-text);">REF: ${t.id.substring(0,8)}</span>
        </div>

        <h1 style="font-size: 1.6rem; color: var(--deep-forest); margin-bottom: 4px;">${t.product_name}</h1>
        <div style="font-size: 1.8rem; font-family: var(--font-heading); color: var(--primary-green); font-weight: 700; margin-bottom: 12px;">
          ${e(t.purchase_price)}
        </div>

        <div class="info-grid">
          <div class="info-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text);">CYCLE DURATION</span>
            <div style="font-weight: 700;">${t.duration_days} Days</div>
          </div>
          <div class="info-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text);">DAILY SETTLEMENT</span>
            <div style="font-weight: 700; color: var(--bright-gold);">${e(t.daily_income)}</div>
          </div>
          <div class="info-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text);">TOTAL EXPECTED</span>
            <div style="font-weight: 700;">${e(t.total_payout)}</div>
          </div>
          <div class="info-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text);">TOTAL CREDITED</span>
            <div style="font-weight: 700; color: var(--success-green);">${e(t.total_paid_out)}</div>
          </div>
          <div class="info-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text);">PURCHASE DATE</span>
            <div style="font-size: 0.85rem; font-weight: 600;">${a(t.created_at)}</div>
          </div>
          <div class="info-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text);">MATURITY DATE</span>
            <div style="font-size: 0.85rem; font-weight: 600;">${a(t.maturity_date)}</div>
          </div>
        </div>

        <h3 style="font-size: 1.1rem; color: var(--deep-forest); margin: 20px 0 10px;">Payout History</h3>
        ${!o||o.length===0?`
          <div style="background: #FAFAFA; padding: 14px; text-align: center; border-radius: var(--radius-sm); color: var(--secondary-text); font-size: 0.85rem;">
            No settlements distributed yet. Automated engine runs every 24 hours.
          </div>
        `:`
          <div class="table-responsive">
            <table class="tx-table">
              <thead><tr><th>Date</th><th>Type</th><th>Amount</th></tr></thead>
              <tbody>
                ${o.map(r=>`
                  <tr>
                    <td>${a(r.payout_date)}</td>
                    <td style="text-transform: capitalize;">${r.payout_type.replace("_"," ")}</td>
                    <td style="color: var(--success-green); font-weight: 700;">${e(r.amount)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `}
      `}p();
