import{r as l,s as v}from"./supabase-client-BCUvSBAr.js";import{i as m}from"./user-navigation-CnUP_QeE.js";import{a as n}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";async function f(){if(await m({requireSession:!0}),!await l())return;const{data:r}=await v.rpc("get_leaderboard_top10"),s=document.getElementById("podiumContainer"),a=document.getElementById("rankingTableContainer");if(!r||r.length===0){s.style.display="none",a.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No qualified team deposits recorded yet. Be the first to claim Rank #1!</p>';return}const i=r.find(e=>e.rank===1),t=r.find(e=>e.rank===2),o=r.find(e=>e.rank===3);s.innerHTML=`
        <div class="podium-card rank-2">
          <div class="podium-crest">🥈</div>
          <div style="font-weight: 700; font-size: 0.85rem; color: var(--deep-forest); overflow: hidden; text-overflow: ellipsis;">@${(t==null?void 0:t.username)||"—"}</div>
          <div style="color: var(--primary-green); font-size: 0.8rem; font-weight: 700; margin-top: 4px;">${t?n(t.qualifying_team_deposits):"₦0"}</div>
          <div style="font-size: 0.7rem; color: var(--secondary-text);">${(t==null?void 0:t.total_downlines)||0} downlines</div>
        </div>

        <div class="podium-card rank-1">
          <div class="podium-crest">👑</div>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--deep-forest); overflow: hidden; text-overflow: ellipsis;">@${(i==null?void 0:i.username)||"—"}</div>
          <div style="color: var(--primary-green); font-size: 0.95rem; font-weight: 700; font-family: var(--font-heading); margin-top: 4px;">${i?n(i.qualifying_team_deposits):"₦0"}</div>
          <div style="font-size: 0.75rem; color: var(--secondary-text);">${(i==null?void 0:i.total_downlines)||0} downlines</div>
        </div>

        <div class="podium-card rank-3">
          <div class="podium-crest">🥉</div>
          <div style="font-weight: 700; font-size: 0.85rem; color: var(--deep-forest); overflow: hidden; text-overflow: ellipsis;">@${(o==null?void 0:o.username)||"—"}</div>
          <div style="color: var(--primary-green); font-size: 0.8rem; font-weight: 700; margin-top: 4px;">${o?n(o.qualifying_team_deposits):"₦0"}</div>
          <div style="font-size: 0.7rem; color: var(--secondary-text);">${(o==null?void 0:o.total_downlines)||0} downlines</div>
        </div>
      `;const d=r.filter(e=>e.rank>3);if(d.length===0){a.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 20px;">Positions 4 through 10 are open for qualification.</p>';return}a.innerHTML=d.map(e=>`
        <div class="leader-row">
          <div style="display: flex; align-items: center; gap: 12px;">
            <strong style="font-size: 0.95rem; color: var(--secondary-text); width: 24px;">#${e.rank}</strong>
            <div>
              <div style="font-weight: 700; color: var(--deep-forest); font-size: 0.9rem;">@${e.username}</div>
              <div style="font-size: 0.75rem; color: var(--secondary-text);">${e.total_downlines} direct & indirect downlines</div>
            </div>
          </div>
          <div style="font-weight: 700; color: var(--primary-green); font-family: var(--font-heading); font-size: 1rem;">
            ${n(e.qualifying_team_deposits)}
          </div>
        </div>
      `).join("")}f();
