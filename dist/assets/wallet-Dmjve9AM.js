import{r as d,s}from"./supabase-client-BCUvSBAr.js";import{i}from"./user-navigation-FagTkAhj.js";import{a,f as l}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";async function c(){await i({requireSession:!0});const n=await d();if(!n)return;const{data:e}=await s.from("wallets").select("*").eq("user_id",n.user.id).single();e&&(document.getElementById("walletBalance").textContent=a(e.balance),document.getElementById("reservedBalance").textContent=a(e.reserved_balance),document.getElementById("totalDeposited").textContent=a(e.total_deposited),document.getElementById("totalWithdrawn").textContent=a(e.total_withdrawn));const{data:r}=await s.from("transactions").select("*").eq("user_id",n.user.id).order("created_at",{ascending:!1}).limit(6),o=document.getElementById("txLedgerContainer");if(!r||r.length===0){o.innerHTML='<div style="text-align: center; padding: 24px; color: var(--secondary-text);">No transactions on ledger yet.</div>';return}o.innerHTML=`
        <table class="tx-table">
          <thead>
            <tr><th>Description</th><th>Amount</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            ${r.map(t=>`
              <tr>
                <td style="font-weight: 600;">${t.description||t.type.replace(/_/g," ")}</td>
                <td style="color: ${Number(t.amount)>=0?"var(--success-green)":"var(--error-red)"}; font-weight: 700;">
                  ${a(t.amount)}
                </td>
                <td>
                  <span class="badge-status ${t.status==="completed"?"badge-completed":t.status==="pending"?"badge-pending":"badge-failed"}">
                    ${t.status}
                  </span>
                </td>
                <td style="color: var(--secondary-text); font-size: 0.8rem;">${l(t.created_at)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}c();
