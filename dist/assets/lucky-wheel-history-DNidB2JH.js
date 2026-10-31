import{r as o,s}from"./supabase-client-BCUvSBAr.js";import{i}from"./user-navigation-CnUP_QeE.js";import{a as d,f as n}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";async function p(){await i({requireSession:!0});const r=await o();if(!r)return;const{data:e}=await s.from("lucky_wheel_spins").select("*").eq("user_id",r.user.id).order("created_at",{ascending:!1}),a=document.getElementById("historyCard");if(!e||e.length===0){a.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No spins recorded yet. Go spin the Lucky Wheel!</p>';return}a.innerHTML=`
        <div class="table-responsive">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 440px;">
            <thead>
              <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
                <th style="padding: 12px;">Reference</th>
                <th style="padding: 12px;">Slot</th>
                <th style="padding: 12px;">Prize Awarded</th>
                <th style="padding: 12px;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${e.map(t=>`
                <tr style="border-bottom: 1px solid #ECECEC;">
                  <td style="padding: 12px; font-family: monospace;">${t.reference}</td>
                  <td style="padding: 12px;">Slot #${t.slot_won}</td>
                  <td style="padding: 12px; font-weight: 700; color: var(--success-green);">${d(t.prize_amount)}</td>
                  <td style="padding: 12px; color: var(--secondary-text); font-size: 0.8rem;">${n(t.created_at)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `}p();
