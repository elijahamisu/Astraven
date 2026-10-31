import{s as l}from"../supabase-client-BCUvSBAr.js";import{i as b}from"../admin-navigation-CfdeLVZw.js";import{a as o,f}from"../formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"../mobile-cards-DX-1T3ZF.js";let m=null,d=null;async function x(){var c;const s=await b();if(!s)return;m=s.session,d=new URLSearchParams(window.location.search).get("id");const t=document.getElementById("userDossierContainer");if(!d){t.innerHTML='<p style="color: var(--error-red);">No user ID provided.</p>';return}const{data:e}=await l.from("profiles").select("*").eq("id",d).single(),{data:a}=await l.from("wallets").select("*").eq("user_id",d).single(),{data:r}=await l.from("user_roles").select("role").eq("user_id",d).maybeSingle();if(!e){t.innerHTML='<p style="color: var(--error-red);">Account not found.</p>';return}t.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ECECEC; padding-bottom: 14px; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h2 style="font-size: 1.4rem; color: var(--deep-forest);">@${e.username}</h2>
            <span style="font-size: 0.8rem; color: var(--secondary-text); font-family: monospace;">UUID: ${e.id}</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="suspendToggleBtn" class="${e.is_suspended?"btn-gold":"btn-emerald"}" style="padding: 8px 16px; font-size: 0.82rem;">
              ${e.is_suspended?"Reactivate Account":"Suspend Account"}
            </button>
          </div>
        </div>

        <div class="dossier-grid">
          <div class="dossier-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text); text-transform: uppercase;">FULL NAME</span>
            <div style="font-weight: 700; color: var(--deep-forest); font-size: 1rem;">${e.full_name||"—"}</div>
          </div>
          <div class="dossier-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text); text-transform: uppercase;">PHONE</span>
            <div style="font-weight: 700; color: var(--deep-forest);">${e.phone||"—"}</div>
          </div>
          <div class="dossier-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text); text-transform: uppercase;">AFFILIATE CODE</span>
            <div style="font-weight: 700; color: var(--metallic-gold); font-family: monospace;">${e.referral_code}</div>
          </div>
          <div class="dossier-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text); text-transform: uppercase;">SYSTEM ROLE</span>
            <div style="font-weight: 700; color: var(--primary-green);">${((c=r==null?void 0:r.role)==null?void 0:c.toUpperCase())||"USER"}</div>
          </div>
          <div class="dossier-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text); text-transform: uppercase;">AVAILABLE WALLET</span>
            <div style="font-weight: 700; color: var(--primary-green); font-size: 1.2rem;">${o((a==null?void 0:a.balance)||0)}</div>
          </div>
          <div class="dossier-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text); text-transform: uppercase;">RESERVED FUNDS</span>
            <div style="font-weight: 700;">${o((a==null?void 0:a.reserved_balance)||0)}</div>
          </div>
          <div class="dossier-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text); text-transform: uppercase;">TOTAL DEPOSITED</span>
            <div style="font-weight: 700;">${o((a==null?void 0:a.total_deposited)||0)}</div>
          </div>
          <div class="dossier-cell">
            <span style="font-size: 0.72rem; color: var(--secondary-text); text-transform: uppercase;">TOTAL WITHDRAWN</span>
            <div style="font-weight: 700;">${o((a==null?void 0:a.total_withdrawn)||0)}</div>
          </div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <a href="/admin/wallet-adjustments.html?userId=${e.id}" class="btn-emerald" style="padding: 10px 18px; font-size: 0.85rem; text-decoration: none;">Adjust Wallet</a>
          <button id="triggerGrantModalBtn" class="btn-gold" style="padding: 10px 18px; font-size: 0.85rem;">Grant Flight Package</button>
        </div>
      `,document.getElementById("suspendToggleBtn").addEventListener("click",async()=>{const y=prompt("State administrative reason:");if(!y)return;const{data:p,error:E}=await l.rpc("admin_toggle_user_suspension",{p_admin_id:m.user.id,p_user_id:d,p_suspend:!e.is_suspended,p_reason:y});E||!p.success?alert((p==null?void 0:p.error)||"Failed"):(alert("Account status updated."),x())}),document.getElementById("triggerGrantModalBtn").addEventListener("click",v),document.getElementById("openGrantModalBtn").addEventListener("click",v),h(),$(),_()}async function h(){const s=document.getElementById("userInvestmentsContainer"),{data:n,error:t}=await l.from("investments").select("*").eq("user_id",d).order("created_at",{ascending:!1});if(t||!n||n.length===0){s.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 24px;">No active or past flight packages for this user.</p>';return}s.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 600px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">Package Name</th>
              <th style="padding: 12px;">Value</th>
              <th style="padding: 12px;">Settled</th>
              <th style="padding: 12px;">Total Payout</th>
              <th style="padding: 12px;">Maturity Date</th>
              <th style="padding: 12px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(e=>{var a;return`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 12px;">
                  <strong style="color: var(--deep-forest);">${e.product_name}</strong>
                  ${(a=e.metadata)!=null&&a.is_admin_grant?'<span class="badge-status badge-completed" style="font-size:0.65rem; margin-left:4px;">ADMIN GRANT</span>':""}
                </td>
                <td style="padding: 12px; font-weight: 700; color: var(--primary-green);">${o(e.purchase_price)}</td>
                <td style="padding: 12px;">${e.days_settled} / ${e.duration_days} Days</td>
                <td style="padding: 12px; font-weight: 700;">${o(e.total_payout)}</td>
                <td style="padding: 12px; color: var(--secondary-text); font-size: 0.75rem;">${f(e.maturity_date,{includeTime:!1})}</td>
                <td style="padding: 12px;"><span class="badge-status ${e.status==="active"?"badge-completed":"badge-pending"}">${e.status}</span></td>
              </tr>
            `}).join("")}
          </tbody>
        </table>
      `}async function _(){const s=document.getElementById("productSelect"),{data:n}=await l.from("products").select("id, code, name, price, duration_days, product_categories(name)").is("archived_at",null).order("price",{ascending:!0});n&&(s.innerHTML='<option value="">-- Choose Package to Grant --</option>'+n.map(t=>{var e;return`
            <option value="${t.id}">
              [${((e=t.product_categories)==null?void 0:e.name)||"VIP"}] ${t.name} - ${o(t.price)} (${t.duration_days} Days)
            </option>
          `}).join(""))}function v(){document.getElementById("grantModal").classList.add("active")}document.getElementById("closeModalBtn").addEventListener("click",()=>{document.getElementById("grantModal").classList.remove("active")});document.getElementById("grantProductForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("submitGrantBtn"),t=document.getElementById("productSelect").value,e=document.getElementById("grantReason").value.trim();if(!t)return alert("Please select a product.");n.disabled=!0,n.textContent="Granting Package...";try{const r=await(await fetch("/api/admin/grant-product",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m.access_token}`},body:JSON.stringify({targetUserId:d,productId:t,reason:e})})).json();r.success?(alert(`Package "${r.product_name}" granted successfully! Ref: ${r.reference}`),document.getElementById("grantModal").classList.remove("active"),document.getElementById("grantProductForm").reset(),h()):alert(r.error||"Failed to grant product.")}catch{alert("Server error executing package grant.")}finally{n.disabled=!1,n.textContent="Confirm & Activate Package"}});let i=[],u="all";async function $(){const s=document.getElementById("userDownlineContainer"),{data:n,error:t}=await l.rpc("admin_get_user_downlines",{p_user_id:d});if(t){s.innerHTML=`<p style="text-align: center; color: var(--error-red); padding: 24px;">Could not load downline: ${t.message}</p>`;return}i=n||[];const e=i.filter(r=>r.is_active).length;document.querySelector('[data-count="all"]').textContent=i.length,document.querySelector('[data-count="active"]').textContent=e,document.querySelector('[data-count="inactive"]').textContent=i.length-e;const a=i.reduce((r,c)=>r+Number(c.total_deposits||0),0);document.getElementById("downlineSummary").textContent=`${i.length} members · ${e} active · Team deposits ${o(a)}`,g()}function g(){const s=document.getElementById("userDownlineContainer"),n=Number(document.getElementById("downlineLevel").value),t=i.filter(e=>(u==="all"||u==="active"===e.is_active)&&(!n||e.level===n));if(!t.length){s.innerHTML=`<p style="text-align: center; color: var(--secondary-text); padding: 24px;">${i.length?"No downline members match this filter.":"This user has no downline yet."}</p>`;return}s.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 650px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">Member</th>
              <th style="padding: 12px;">Level</th>
              <th style="padding: 12px;">Status</th>
              <th style="padding: 12px;">Deposits</th>
              <th style="padding: 12px;">Running Packages</th>
              <th style="padding: 12px;">Joined</th>
              <th style="padding: 12px;"></th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 12px;">
                  <strong style="color: var(--deep-forest);">@${e.username||"—"}</strong>
                  <div style="font-size: 0.75rem; color: var(--secondary-text);">${e.full_name||""}${e.phone?" · "+e.phone:""}</div>
                </td>
                <td style="padding: 12px;">L${e.level}</td>
                <td style="padding: 12px;">
                  <span class="badge-status ${e.is_active?"badge-completed":"badge-pending"}">${e.is_active?"ACTIVE":"INACTIVE"}</span>
                  ${e.is_suspended?'<span class="badge-status badge-failed" style="margin-left:4px;">SUSPENDED</span>':""}
                </td>
                <td style="padding: 12px; font-weight: 700; color: var(--primary-green);">${o(e.total_deposits)} <small style="color: var(--secondary-text); font-weight: 400;">(${e.deposit_count})</small></td>
                <td style="padding: 12px;">${e.active_investments} · ${o(e.invested_amount)}</td>
                <td style="padding: 12px; color: var(--secondary-text); font-size: 0.75rem;">${f(e.joined_at,{includeTime:!1})}</td>
                <td style="padding: 12px;"><a href="/admin/user-details.html?id=${e.user_id}" class="btn-emerald" style="padding: 6px 12px; font-size: 0.75rem; text-decoration: none;">View</a></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}document.getElementById("downlineFilters").addEventListener("click",s=>{const n=s.target.closest(".dl-chip");n&&(u=n.dataset.filter,document.querySelectorAll(".dl-chip").forEach(t=>t.classList.toggle("active",t===n)),g())});document.getElementById("downlineLevel").addEventListener("change",g);x();
