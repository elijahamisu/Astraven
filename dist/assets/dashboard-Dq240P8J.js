import{r as c,s as o}from"./supabase-client-BCUvSBAr.js";import{i as m}from"./user-navigation-FagTkAhj.js";import{a,f as u}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";async function f(){var d;await m({requireSession:!0});const l=await c();if(!l)return;const s=l.user.id,{data:t}=await o.from("profiles").select("full_name, username, referral_code").eq("id",s).maybeSingle();if(t){const e=t.full_name||t.username||"Investor";document.getElementById("welcomeUser").textContent=`Welcome, ${e}`,t.referral_code&&(document.getElementById("refLinkInput").value=`${window.location.origin}/register.html?ref=${t.referral_code}`)}const{data:n}=await o.from("wallets").select("balance, reserved_balance, total_deposited, total_withdrawn").eq("user_id",s).maybeSingle();n&&(document.getElementById("walletBalance").textContent=a(n.balance),document.getElementById("reservedBalance").textContent=a(n.reserved_balance),document.getElementById("totalDeposited").textContent=a(n.total_deposited),document.getElementById("totalWithdrawn").textContent=a(n.total_withdrawn));const{data:i}=await o.from("transactions").select("type, amount, status, created_at").eq("user_id",s).order("created_at",{ascending:!1}).limit(5);i&&i.length>0&&(document.getElementById("txLedgerContainer").innerHTML=`
          <table class="tx-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${i.map(e=>`
                <tr>
                  <td style="font-weight: 600; text-transform: capitalize;">${e.type.replace(/_/g," ")}</td>
                  <td style="color: ${Number(e.amount)>=0?"var(--success-green)":"var(--error-red)"}; font-weight: 700;">
                    ${a(e.amount)}
                  </td>
                  <td>
                    <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:${e.status==="completed"?"var(--success-green)":e.status==="pending"?"var(--pending-orange)":"var(--error-red)"};">
                      ${e.status}
                    </span>
                  </td>
                  <td style="color: var(--secondary-text); font-size: 0.8rem;">${u(e.created_at)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `);const{data:r}=await o.from("announcements").select("title, content").eq("is_active",!0).order("priority",{ascending:!1}).limit(1);r&&r.length>0&&(document.getElementById("announcementTitle").textContent=`✦ ${r[0].title}`,document.getElementById("announcementContent").textContent=r[0].content,document.getElementById("announcementBox").style.display="block"),(d=document.getElementById("copyRefBtn"))==null||d.addEventListener("click",()=>{navigator.clipboard.writeText(document.getElementById("refLinkInput").value),alert("ASTRAVEN referral link copied to clipboard!")})}f();
