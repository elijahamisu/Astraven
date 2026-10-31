import{s as o}from"../supabase-client-DdZx35sm.js";import{i as n}from"../admin-navigation-Ck9BqSXZ.js";import{a as i}from"../formatters-kkpPVsns.js";import"../mobile-cards-DX-1T3ZF.js";async function d(){if(!await n())return;const{data:e,error:r}=await o.rpc("get_leaderboard_top10"),a=document.getElementById("lbTableContainer");if(r||!e||e.length===0){a.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No qualifying deposits on file.</p>';return}a.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 500px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">Rank</th>
              <th style="padding: 12px;">User</th>
              <th style="padding: 12px;">Verified Team Volume</th>
              <th style="padding: 12px;">Network Size</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(t=>`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 12px; font-weight: 700; font-size: 1.1rem; color: var(--metallic-gold);">#${t.rank}</td>
                <td style="padding: 12px; font-weight: 600;">@${t.username}</td>
                <td style="padding: 12px; font-weight: 700; color: var(--primary-green); font-size: 1rem;">${i(t.qualifying_team_deposits)}</td>
                <td style="padding: 12px;">${t.total_downlines} members</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}d();
