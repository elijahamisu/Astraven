import{s as e}from"../supabase-client-BCUvSBAr.js";import{i as r}from"../admin-navigation-CfdeLVZw.js";import{f as c}from"../formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"../mobile-cards-DX-1T3ZF.js";async function u(){if(!await r())return;const{count:o}=await e.from("profiles").select("*",{count:"exact",head:!0});document.getElementById("metricUsers").textContent=o||0;const{count:s}=await e.from("deposits").select("*",{count:"exact",head:!0}).eq("status","pending");document.getElementById("metricPendingDep").textContent=s||0;const{count:d}=await e.from("withdrawals").select("*",{count:"exact",head:!0}).eq("status","pending");document.getElementById("metricPendingWith").textContent=d||0;const{count:i}=await e.from("investments").select("*",{count:"exact",head:!0}).eq("status","active");document.getElementById("metricActiveInvs").textContent=i||0;const{data:n}=await e.from("cron_runs").select("*").order("run_at",{ascending:!1}).limit(6),a=document.getElementById("cronLogsContainer");if(!n||n.length===0){a.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 20px;">No income processing runs on record yet.</p>';return}a.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 480px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 10px;">Run Time</th>
              <th style="padding: 10px;">Status</th>
              <th style="padding: 10px;">VIP Payouts</th>
              <th style="padding: 10px;">Maturity Payouts</th>
              <th style="padding: 10px;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(t=>`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 10px;">${c(t.run_at)}</td>
                <td style="padding: 10px;"><span class="badge-status badge-completed">${t.status}</span></td>
                <td style="padding: 10px;">${t.vip_payouts_count}</td>
                <td style="padding: 10px;">${t.maturity_payouts_count}</td>
                <td style="padding: 10px;">${t.execution_time_ms||0} ms</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}u();
