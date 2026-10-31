import{r as l,s as c}from"./supabase-client-BCUvSBAr.js";import{i as f}from"./user-navigation-C7tDwe5x.js";import{a as u,f as m}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-1MPb4jkf.js";import"./mobile-cards-DX-1T3ZF.js";let r=[];async function p(){await f({requireSession:!0});const s=await l();if(!s)return;const{data:a,error:e}=await c.from("transactions").select("*").eq("user_id",s.user.id).order("created_at",{ascending:!1}).limit(100),o=document.getElementById("txContainer");if(e||!a||a.length===0){o.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No transactions found on ledger.</p>';return}r=a,n(r),document.querySelectorAll(".filter-btn").forEach(d=>{d.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(t=>t.classList.remove("active")),d.classList.add("active");const i=d.dataset.filter;i==="all"?n(r):i==="deposit"?n(r.filter(t=>t.type.includes("deposit"))):i==="withdrawal"?n(r.filter(t=>t.type.includes("withdrawal"))):i==="investment"?n(r.filter(t=>t.type.includes("investment"))):i==="reward"&&n(r.filter(t=>t.type.includes("reward")||t.type.includes("commission")||t.type.includes("bonus")))})})}function n(s){const a=document.getElementById("txContainer");if(s.length===0){a.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 30px;">No records match this filter.</p>';return}a.innerHTML=`
        <table class="tx-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${s.map(e=>{const o=Number(e.amount)>=0;return`
                <tr>
                  <td style="font-family: monospace; font-size: 0.75rem; color: var(--secondary-text);">${e.reference}</td>
                  <td style="font-weight: 600;">
                    ${e.description||e.type.replace(/_/g," ")}
                  </td>
                  <td style="font-weight: 700; color: ${o?"var(--success-green)":"var(--error-red)"};">
                    ${o?"+":""}${u(e.amount)}
                  </td>
                  <td>
                    <span class="badge-status ${e.status==="completed"?"badge-completed":e.status==="pending"?"badge-pending":"badge-failed"}">
                      ${e.status}
                    </span>
                  </td>
                  <td style="color: var(--secondary-text); font-size: 0.8rem;">${m(e.created_at)}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      `}p();
