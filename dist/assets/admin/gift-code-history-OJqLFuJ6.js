import{s as i}from"../supabase-client-BCUvSBAr.js";import{i as n}from"../admin-navigation-CfdeLVZw.js";import{a as s,f as l}from"../formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"../mobile-cards-DX-1T3ZF.js";async function p(){if(!await n())return;const{data:e,error:d}=await i.from("gift_code_redemptions").select("*, gift_codes(code), profiles(username)").order("created_at",{ascending:!1}).limit(100),r=document.getElementById("redemptionsTableContainer");if(d||!e||e.length===0){r.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No voucher claims recorded.</p>';return}r.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 600px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">Voucher Code</th>
              <th style="padding: 12px;">User</th>
              <th style="padding: 12px;">Amount Credited</th>
              <th style="padding: 12px;">Claim Date</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(t=>{var o,a;return`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 12px; font-weight: 700; font-family: monospace; color: var(--metallic-gold);">${((o=t.gift_codes)==null?void 0:o.code)||"—"}</td>
                <td style="padding: 12px; font-weight: 600;">@${((a=t.profiles)==null?void 0:a.username)||"user"}</td>
                <td style="padding: 12px; font-weight: 700; color: var(--primary-green);">${s(t.reward_amount)}</td>
                <td style="padding: 12px; color: var(--secondary-text); font-size: 0.8rem;">${l(t.created_at)}</td>
              </tr>
            `}).join("")}
          </tbody>
        </table>
      `}p();
