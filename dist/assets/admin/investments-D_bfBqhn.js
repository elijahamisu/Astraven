import{s as i}from"../supabase-client-BCUvSBAr.js";import{i as p}from"../admin-navigation-CfdeLVZw.js";import{a as d,f as g}from"../formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"../mobile-cards-DX-1T3ZF.js";let c=null;async function m(){const r=await p();if(!r)return;c=r.session;const{data:e,error:a}=await i.from("investments").select("*, profiles(username)").order("created_at",{ascending:!1}).limit(100),n=document.getElementById("invTableContainer");if(a||!e||e.length===0){n.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No investor contracts active.</p>';return}n.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 650px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">Package / Investor</th>
              <th style="padding: 12px;">Capital</th>
              <th style="padding: 12px;">Settled Days</th>
              <th style="padding: 12px;">Total Paid</th>
              <th style="padding: 12px;">Maturity Date</th>
              <th style="padding: 12px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(t=>{var s,o;return`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 12px;">
                  <strong style="color: var(--deep-forest);">${t.product_name}</strong>
                  ${(s=t.metadata)!=null&&s.is_admin_grant?'<span class="badge-status badge-completed" style="font-size:0.65rem; margin-left:4px;">ADMIN GRANT</span>':""}
                  <div style="font-size: 0.75rem; color: var(--secondary-text);">@${((o=t.profiles)==null?void 0:o.username)||"user"}</div>
                </td>
                <td style="padding: 12px; font-weight: 700; color: var(--primary-green);">${d(t.purchase_price)}</td>
                <td style="padding: 12px;">${t.days_settled} / ${t.duration_days} Days</td>
                <td style="padding: 12px; font-weight: 700; color: var(--success-green);">${d(t.total_paid_out)}</td>
                <td style="padding: 12px; font-size: 0.8rem; color: var(--secondary-text);">${g(t.maturity_date,{includeTime:!1})}</td>
                <td style="padding: 12px;"><span class="badge-status ${t.status==="active"?"badge-completed":"badge-pending"}">${t.status}</span></td>
              </tr>
            `}).join("")}
          </tbody>
        </table>
      `,u()}async function u(){const r=document.getElementById("globalProductSelect"),{data:e}=await i.from("products").select("id, name, price, duration_days, product_categories(name)").order("price",{ascending:!0});e&&(r.innerHTML='<option value="">-- Choose Package --</option>'+e.map(a=>{var n;return`
            <option value="${a.id}">
              [${((n=a.product_categories)==null?void 0:n.name)||"VIP"}] ${a.name} - ${d(a.price)} (${a.duration_days} Days)
            </option>
          `}).join(""))}const l=document.getElementById("globalGrantModal");document.getElementById("openGlobalGrantModalBtn").addEventListener("click",()=>l.classList.add("active"));document.getElementById("closeGlobalModalBtn").addEventListener("click",()=>l.classList.remove("active"));document.getElementById("globalGrantForm").addEventListener("submit",async r=>{r.preventDefault();const e=document.getElementById("submitGlobalGrantBtn"),a=document.getElementById("globalUserUuid").value.trim(),n=document.getElementById("globalProductSelect").value,t=document.getElementById("globalGrantReason").value.trim();e.disabled=!0,e.textContent="Granting Package...";try{const o=await(await fetch("/api/admin/grant-product",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c.access_token}`},body:JSON.stringify({targetUserId:a,productId:n,reason:t})})).json();o.success?(alert(`Package "${o.product_name}" granted successfully! Ref: ${o.reference}`),l.classList.remove("active"),document.getElementById("globalGrantForm").reset(),m()):alert(o.error||"Failed to grant package.")}catch{alert("Communication error with serverless endpoint.")}finally{e.disabled=!1,e.textContent="Execute Package Grant"}});m();
