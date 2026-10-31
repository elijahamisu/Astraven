import{s as i}from"../supabase-client-DdZx35sm.js";import{i as d}from"../admin-navigation-Ck9BqSXZ.js";import{a as s,f as m}from"../formatters-kkpPVsns.js";import"../mobile-cards-DX-1T3ZF.js";async function l(){if(!await d())return;const{data:e,error:n}=await i.from("referral_commissions").select("*, ref:profiles!referral_commissions_referrer_id_fkey(username), down:profiles!referral_commissions_referred_id_fkey(username)").order("created_at",{ascending:!1}).limit(100),r=document.getElementById("commsTableContainer");if(n||!e||e.length===0){r.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No commissions distributed yet.</p>';return}r.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 600px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">Referrer</th>
              <th style="padding: 12px;">Downline</th>
              <th style="padding: 12px;">Deposit Amount</th>
              <th style="padding: 12px;">Commission (10%)</th>
              <th style="padding: 12px;">Settled Date</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(t=>{var o,a;return`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 12px; font-weight: 700; color: var(--deep-forest);">@${((o=t.ref)==null?void 0:o.username)||"user"}</td>
                <td style="padding: 12px;">@${((a=t.down)==null?void 0:a.username)||"user"}</td>
                <td style="padding: 12px;">${s(t.deposit_amount)}</td>
                <td style="padding: 12px; font-weight: 700; color: var(--primary-green);">${s(t.commission_amount)}</td>
                <td style="padding: 12px; color: var(--secondary-text); font-size: 0.8rem;">${m(t.created_at)}</td>
              </tr>
            `}).join("")}
          </tbody>
        </table>
      `}l();
