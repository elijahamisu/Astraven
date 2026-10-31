import{s as p}from"../supabase-client-DdZx35sm.js";import{i as g}from"../admin-navigation-Ck9BqSXZ.js";import{f as y,a as w}from"../formatters-kkpPVsns.js";import"../mobile-cards-DX-1T3ZF.js";let c=null,v=[];async function l(){const a=await g();if(!a)return;c=a.session;const t=document.getElementById("depositsFeed"),{data:s,error:e}=await p.from("deposits").select(`
          id, reference, amount, sender_name, transfer_reference, receipt_url, status, created_at, gateway, platform_osn, rejection_reason,
          profiles:user_id(username, full_name)
        `).order("created_at",{ascending:!1}).limit(100);if(e){t.innerHTML=`
          <div class="empty-state-box" style="color: var(--error-red);">
            <p><strong>Failed to load deposits:</strong> ${e.message}</p>
            <button class="btn-gold" style="margin-top: 14px; padding: 8px 18px;" onclick="window.location.reload()">Retry</button>
          </div>
        `;return}if(!s||s.length===0){t.innerHTML=`
          <div class="empty-state-box">
            <p>No deposit submissions found.</p>
          </div>
        `;return}v=s,f("all"),document.querySelectorAll(".filter-btn").forEach(r=>{r.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(n=>n.classList.remove("active")),r.classList.add("active"),f(r.dataset.filter)})})}function f(a){const t=document.getElementById("depositsFeed"),s=v.filter(e=>a==="all"||e.status===a);if(s.length===0){t.innerHTML=`
          <div class="empty-state-box" style="grid-column: 1 / -1;">
            <p>No deposits match this filter.</p>
          </div>
        `;return}t.innerHTML=s.map(e=>{var u,m;const r=e.status==="pending",n=["afrstar","mgm"].includes(e.gateway),i=e.status==="approved"?"badge-completed":r?"badge-pending":"badge-failed",d=((u=e.profiles)==null?void 0:u.username)||"user",o=((m=e.profiles)==null?void 0:m.full_name)||e.sender_name||"Investor";return`
          <div class="deposit-card" id="card-${e.id}">
            <!-- Top Bar -->
            <div class="card-top-bar">
              <div>
                <span class="ref-code">${e.reference}</span>
                <span class="ref-date">${y(e.created_at)}</span>
              </div>
              <span class="badge-status ${i}">
                ${e.status.toUpperCase()}
              </span>
            </div>

            <!-- Body -->
            <div class="card-body">
              <div class="amount-investor-row">
                <div>
                  <span class="amount-label">Deposit Amount</span>
                  <div class="amount-value">${w(e.amount)}</div>
                </div>
                <div class="investor-meta">
                  <span class="amount-label">Investor</span>
                  <span class="investor-handle">@${d}</span>
                  <span class="investor-name">${o}</span>
                </div>
              </div>

              <!-- Narration Details -->
              <div class="narration-box">
                <span class="narration-label">${n?"Gateway Payment Reference":"Bank Narration / Reference"}</span>
                <div class="narration-text">${b(e.transfer_reference||(n?e.platform_osn?"Order "+e.platform_osn:"Awaiting payment":"None provided"))}</div>
              </div>

              <!-- Receipt Proof -->
              ${e.receipt_url?`
                <button class="proof-btn" onclick="viewReceipt('${e.receipt_url}')">
                  <span>📎</span>
                  <span>View Payment Receipt Screenshot</span>
                </button>
              `:""}
            </div>

            <!-- Action Buttons -->
            <div class="card-actions-row">
              ${r&&n?`
                <div class="settled-note" style="grid-column: span 2;">
                  Gateway deposit. Credited automatically when the gateway confirms payment.
                </div>
              `:r?`
                <button class="btn-approve-action" onclick="reviewDep('${e.id}', 'approved')">
                  <span>✓</span>
                  <span>Approve &amp; Credit</span>
                </button>
                <button class="btn-reject-action" onclick="reviewDep('${e.id}', 'rejected')">
                  <span>✕</span>
                  <span>Reject</span>
                </button>
              `:`
                <div class="settled-note" style="grid-column: span 2;">
                  This request has been settled (${e.status}).
                </div>
              `}
            </div>
          </div>
        `}).join("")}window.viewReceipt=async function(a){if(a)try{const{data:t,error:s}=await p.storage.from("deposit-receipts").createSignedUrl(a,600);if(s||!(t!=null&&t.signedUrl)){alert("Could not open receipt proof: "+((s==null?void 0:s.message)||"File not found."));return}window.open(t.signedUrl,"_blank")}catch{alert("Receipt access error.")}};window.reviewDep=async function(a,t){let s=null;if(t==="rejected"&&(s=prompt("Enter administrative rejection reason:"),!s))return;const e=document.getElementById(`card-${a}`),r=e==null?void 0:e.querySelector(".card-actions-row");r&&(r.innerHTML=`<div class="settled-note" style="grid-column: span 2;">Processing ${t}...</div>`);try{const{data:n,error:i}=await p.rpc("review_deposit_request",{p_deposit_id:a,p_admin_id:c.user.id,p_decision:t,p_rejection_reason:s});if(i||!(n!=null&&n.success)){const o=await(await fetch("/api/deposits/review",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c.access_token}`},body:JSON.stringify({depositId:a,decision:t,rejectionReason:s})})).json();o.success?alert(`Deposit ${t} successfully!`):alert("Deposit review error: "+(o.error||(i==null?void 0:i.message)||"Action failed"))}else alert(`Deposit ${t} successfully! User wallet credited.`);l()}catch(n){console.error("Fatal review error:",n),alert("Action error: "+n.message),l()}};function b(a){return a?a.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}l();
