import{s as o}from"../supabase-client-BCUvSBAr.js";import{i as d}from"../admin-navigation-CfdeLVZw.js";import{a as i,f as p}from"../formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"../mobile-cards-DX-1T3ZF.js";async function l(){if(!await d())return;const{data:e,error:n}=await o.from("transactions").select("*, profiles(username)").order("created_at",{ascending:!1}).limit(100),a=document.getElementById("txsTableContainer");if(n||!e||e.length===0){a.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No transactions recorded.</p>';return}a.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 650px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">Reference</th>
              <th style="padding: 12px;">Investor</th>
              <th style="padding: 12px;">Type / Description</th>
              <th style="padding: 12px;">Amount</th>
              <th style="padding: 12px;">Date</th>
              <th style="padding: 12px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(t=>{var s;const r=Number(t.amount)>=0;return`
                <tr style="border-bottom: 1px solid #ECECEC;">
                  <td style="padding: 12px; font-family: monospace; font-size: 0.75rem;">${t.reference}</td>
                  <td style="padding: 12px;">@${((s=t.profiles)==null?void 0:s.username)||"user"}</td>
                  <td style="padding: 12px;">
                    <div style="font-weight: 600;">${t.description}</div>
                    <small style="color: var(--secondary-text); text-transform: uppercase;">${t.type}</small>
                  </td>
                  <td style="padding: 12px; font-weight: 700; color: ${r?"var(--success-green)":"var(--error-red)"}; font-size: 0.95rem;">
                    ${r?"+":""}${i(t.amount)}
                  </td>
                  <td style="padding: 12px; color: var(--secondary-text); font-size: 0.78rem;">${p(t.created_at)}</td>
                  <td style="padding: 12px;"><span class="badge-status ${t.status==="completed"?"badge-completed":"badge-pending"}">${t.status}</span></td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      `}l();
