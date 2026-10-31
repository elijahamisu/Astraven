import{s as r}from"../supabase-client-BCUvSBAr.js";import{i}from"../admin-navigation-CfdeLVZw.js";import{f as n}from"../formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"../mobile-cards-DX-1T3ZF.js";async function d(){if(!await i())return;const{data:e,error:o}=await r.from("audit_logs").select("*").order("created_at",{ascending:!1}).limit(100),a=document.getElementById("auditTableContainer");if(o||!e||e.length===0){a.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No logs recorded.</p>';return}a.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 600px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">Action</th>
              <th style="padding: 12px;">Admin ID</th>
              <th style="padding: 12px;">Details</th>
              <th style="padding: 12px;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(t=>`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 12px; font-weight: 700; color: var(--deep-forest);">${t.action}</td>
                <td style="padding: 12px; font-family: monospace; font-size: 0.75rem;">${t.admin_id?t.admin_id.substring(0,8)+"...":"SYSTEM"}</td>
                <td style="padding: 12px; font-family: monospace; font-size: 0.75rem; color: var(--secondary-text);">${JSON.stringify(t.details)}</td>
                <td style="padding: 12px; color: var(--secondary-text); font-size: 0.75rem;">${n(t.created_at)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}d();
