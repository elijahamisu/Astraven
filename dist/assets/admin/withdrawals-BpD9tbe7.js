import{s as y}from"../supabase-client-BCUvSBAr.js";import{i as $}from"../admin-navigation-CfdeLVZw.js";import{a as l,f as x}from"../formatters-kkpPVsns.js";import{w as _}from"../site-settings-CsXfhtzc.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"../mobile-cards-DX-1T3ZF.js";let h=null,p=[],u="manual",c="all";async function b(){const t=await $();if(!t)return;h=t.session;const r=document.getElementById("withdrawalsFeed"),{data:a,error:o}=await y.from("withdrawals").select("*, profiles:user_id(username, full_name)").order("created_at",{ascending:!1}).limit(100);if(o||!a||a.length===0){r.innerHTML='<div class="empty-state-box"><p>No withdrawal requests found.</p></div>';return}p=a,f(c),document.querySelectorAll(".filter-btn").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(n=>n.classList.remove("active")),e.classList.add("active"),c=e.dataset.filter,f(c)})})}function f(t){const r=document.getElementById("modeBanner");r&&(r.innerHTML=u==="gateway"?"<strong>Gateway mode:</strong> approved payouts are sent automatically through MGM Pay.":"<strong>Manual mode:</strong> transfer to the user yourself, then tap Mark Paid.");const a=document.getElementById("withdrawalsFeed"),o=p.filter(e=>t==="all"||e.status===t);if(o.length===0){a.innerHTML='<div class="empty-state-box" style="grid-column: 1 / -1;"><p>No requests match this filter.</p></div>';return}a.innerHTML=o.map(e=>{var i,g,v;const n=e.status==="pending",d=e.status==="processing",s=e.status==="paid"?"badge-completed":n||d?"badge-pending":"badge-failed",m=(i=e.metadata)==null?void 0:i.last_payout_error;return`
          <div class="with-card" id="card-${e.id}">
            <div class="card-top-bar">
              <div>
                <strong style="font-family: monospace; color: var(--deep-forest); font-size: 0.88rem;">${e.reference}</strong>
                <span style="font-size: 0.75rem; color: var(--secondary-text); display: block;">${x(e.created_at)}</span>
              </div>
              <span class="badge-status ${s}">${e.status.toUpperCase()}</span>
            </div>

            <div class="card-body">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <span style="font-size: 0.7rem; text-transform: uppercase; color: var(--secondary-text);">NET DISBURSEMENT</span>
                  <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 700; color: var(--primary-green);">
                    ${l(e.net_amount)}
                  </div>
                  <span style="font-size: 0.75rem; color: var(--secondary-text);">Gross: ${l(e.amount)} | Fee: ${l(e.fee)}</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 0.7rem; text-transform: uppercase; color: var(--secondary-text);">INVESTOR</span>
                  <div style="font-weight: 700; color: var(--deep-forest);">@${((g=e.profiles)==null?void 0:g.username)||"user"}</div>
                  <div style="font-size: 0.75rem; color: var(--secondary-text);">${((v=e.profiles)==null?void 0:v.full_name)||"—"}</div>
                </div>
              </div>

              <div style="background: var(--light-gold-bg); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.82rem;">
                <div><strong>Bank:</strong> ${e.bank_name}${e.bank_code?` <span style="color: var(--secondary-text);">(${e.bank_code})</span>`:""}</div>
                <div><strong>Account Name:</strong> ${e.account_name}</div>
                <div><strong>Account Number:</strong> <span style="font-family: monospace; font-weight: 700;">${e.account_number}</span></div>
                ${e.payment_reference?`<div style="color: var(--success-green); margin-top: 4px;"><strong>Settlement:</strong> ${e.payment_reference}</div>`:""}
                ${e.platform_osn?`<div style="margin-top: 4px;"><strong>Gateway Order:</strong> <span style="font-family: monospace;">${e.platform_osn}</span></div>`:""}
                ${n&&m?`<div style="color: var(--error-red); margin-top: 4px;"><strong>Last payout error:</strong> ${m}</div>`:""}
                ${e.rejection_reason?`<div style="color: var(--error-red); margin-top: 4px;"><strong>Rejection Reason:</strong> ${e.rejection_reason}</div>`:""}
              </div>
            </div>

            <div class="card-actions-row">
              ${n?`
                ${u==="gateway"?`<button class="btn-gold" style="padding: 12px; font-size: 0.88rem;" onclick="reviewWith('${e.id}', 'approve')">Send to Gateway</button>`:`<button class="btn-gold" style="padding: 12px; font-size: 0.88rem;" onclick="reviewWith('${e.id}', 'paid')">Mark Paid</button>`}
                <button class="btn-emerald" style="padding: 12px; font-size: 0.88rem; background: rgba(215, 25, 32, 0.08); color: var(--error-red); border-color: var(--error-red);" onclick="reviewWith('${e.id}', 'rejected')">Reject</button>
              `:d?`
                <div style="grid-column: span 2; text-align: center; font-size: 0.8rem; color: var(--secondary-text); padding: 6px 0;">Approved, payout sent to gateway. Awaiting bank confirmation.</div>
              `:`
                <div style="grid-column: span 2; text-align: center; font-size: 0.8rem; color: var(--secondary-text); padding: 6px 0;">Settled (${e.status})</div>
              `}
            </div>
          </div>
        `}).join("")}window.reviewWith=async function(t,r){let a=null,o=null;const e=p.find(s=>s.id===t);if(r==="approve"){if(!confirm(`Send ${l((e==null?void 0:e.net_amount)||0)} to ${(e==null?void 0:e.account_name)||""} (${(e==null?void 0:e.bank_name)||""} ${(e==null?void 0:e.account_number)||""}) through the payment gateway?`))return}else if(r==="paid"){if(o=prompt(`Confirm you've transferred ${l((e==null?void 0:e.net_amount)||0)} to ${(e==null?void 0:e.account_name)||""} (${(e==null?void 0:e.bank_name)||""} ${(e==null?void 0:e.account_number)||""}).
Enter the transfer reference (optional):`,""),o===null)return}else if(a=prompt("Enter rejection reason (reserved funds will be refunded to user):"),!a)return;const n=document.getElementById(`card-${t}`),d=n==null?void 0:n.querySelector(".card-actions-row");d&&(d.innerHTML=`<div style="grid-column: span 2; text-align: center; font-size: 0.82rem; color: var(--secondary-text);">${r==="approve"?"Sending to gateway...":r==="paid"?"Marking paid...":"Rejecting..."}</div>`);try{const{data:{session:s}}=await y.auth.getSession(),i=await(await fetch("/api/withdrawals/review",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${(s||h).access_token}`},body:JSON.stringify({withdrawalId:t,action:r,rejectionReason:a,paymentReference:o})})).json().catch(()=>({success:!1,error:"Unexpected server response."}));i.success?alert(r==="approve"?i.warning||"Sent to gateway. Status updates when the bank confirms.":r==="paid"?"Marked as paid.":"Withdrawal rejected and funds refunded."):alert("Action error: "+(i.error||"Failed"))}catch(s){alert("Action error: "+s.message)}b()};_("payment_gateway",t=>{u=(t==null?void 0:t.mode)==="gateway"?"gateway":"manual",p.length&&f(c)});b();
