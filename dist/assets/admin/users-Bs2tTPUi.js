import{s as p}from"../supabase-client-DdZx35sm.js";import{i as c}from"../admin-navigation-Ck9BqSXZ.js";import{f as m}from"../formatters-kkpPVsns.js";import"../mobile-cards-DX-1T3ZF.js";let d=[];async function f(){if(!await c())return;const{data:a,error:e}=await p.from("profiles").select("id, username, full_name, phone, referral_code, is_suspended, created_at").order("created_at",{ascending:!1}).limit(100),o=document.getElementById("usersContainer");if(e||!a||a.length===0){o.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No registered accounts found.</p>';return}d=a,s(d),document.getElementById("searchInput").addEventListener("input",i=>{const r=i.target.value.toLowerCase().trim(),l=d.filter(t=>t.username&&t.username.toLowerCase().includes(r)||t.full_name&&t.full_name.toLowerCase().includes(r)||t.referral_code&&t.referral_code.toLowerCase().includes(r));s(l)})}function s(n){const a=document.getElementById("usersContainer");a.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 600px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">User</th>
              <th style="padding: 12px;">Phone</th>
              <th style="padding: 12px;">Referral Code</th>
              <th style="padding: 12px;">Registered</th>
              <th style="padding: 12px;">Status</th>
              <th style="padding: 12px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(e=>`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 12px;">
                  <strong style="color: var(--deep-forest);">@${e.username}</strong>
                  <div style="font-size: 0.75rem; color: var(--secondary-text);">${e.full_name||"—"}</div>
                </td>
                <td style="padding: 12px;">${e.phone||"—"}</td>
                <td style="padding: 12px; font-family: monospace; font-weight: 700; color: var(--metallic-gold);">${e.referral_code}</td>
                <td style="padding: 12px; color: var(--secondary-text); font-size: 0.75rem;">${m(e.created_at,{includeTime:!1})}</td>
                <td style="padding: 12px;">
                  <span class="badge-status ${e.is_suspended?"badge-failed":"badge-completed"}">
                    ${e.is_suspended?"Suspended":"Active"}
                  </span>
                </td>
                <td style="padding: 12px;">
                  <a href="/admin/user-details.html?id=${e.id}" class="btn-emerald" style="padding: 6px 12px; font-size: 0.75rem; text-decoration: none;">Inspect Profile</a>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}f();
