import{s as d}from"../supabase-client-DdZx35sm.js";import{i}from"../admin-navigation-Ck9BqSXZ.js";import{a as s,f as l}from"../formatters-kkpPVsns.js";import"../mobile-cards-DX-1T3ZF.js";async function r(){if(!await i())return;const{data:t,error:n}=await d.from("gift_codes").select("*").order("created_at",{ascending:!1}),o=document.getElementById("codesTableContainer");if(n||!t||t.length===0){o.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No gift codes issued.</p>';return}o.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 600px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">Code</th>
              <th style="padding: 12px;">Reward</th>
              <th style="padding: 12px;">Capacity Used</th>
              <th style="padding: 12px;">Created</th>
              <th style="padding: 12px;">Status</th>
              <th style="padding: 12px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 12px; font-weight: 700; font-family: monospace; color: var(--metallic-gold); font-size: 1rem;">${e.code}</td>
                <td style="padding: 12px; font-weight: 700; color: var(--primary-green);">${s(e.amount)}</td>
                <td style="padding: 12px;">${e.current_redemptions} / ${e.max_redemptions}</td>
                <td style="padding: 12px; color: var(--secondary-text); font-size: 0.78rem;">${l(e.created_at,{includeTime:!1})}</td>
                <td style="padding: 12px;"><span class="badge-status ${e.is_active?"badge-completed":"badge-failed"}">${e.is_active?"Active":"Disabled"}</span></td>
                <td style="padding: 12px; white-space: nowrap;">
                  <button class="btn-emerald" style="padding: 5px 10px; font-size: 0.72rem;" onclick="toggleCode('${e.id}', ${!e.is_active}, '${e.code}')">${e.is_active?"Deactivate":"Activate"}</button>
                  <button style="padding: 5px 10px; font-size: 0.72rem; background: #B91C1C; color: #fff; border: none; border-radius: 6px; margin-left: 4px;" onclick="deleteCode('${e.id}', '${e.code}', ${Number(e.current_redemptions)||0})">Delete</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}function c(a=10){const t="ABCDEFGHJKMNPQRSTUVWXYZ23456789",n=new Uint32Array(a);crypto.getRandomValues(n);let o="AST";for(let e=0;e<a-3;e++)o+=t[n[e]%t.length];return o}document.getElementById("randomCodeBtn").addEventListener("click",()=>{const a=document.getElementById("codeName");a.value=c(),a.focus()});document.getElementById("newCodeForm").addEventListener("submit",async a=>{a.preventDefault();const t=document.getElementById("codeName").value.trim().toUpperCase(),n=Number(document.getElementById("codeAmount").value),o=Number(document.getElementById("codeCapacity").value),{error:e}=await d.from("gift_codes").insert({code:t,amount:n,max_redemptions:o,reward_type:"wallet",is_active:!0});e?alert(e.message):(alert("Gift code issued!"),document.getElementById("newCodeForm").reset(),r())});window.toggleCode=async function(a,t,n){if(!t&&!confirm(`Deactivate ${n}? Users won't be able to redeem it.`))return;const{error:o}=await d.from("gift_codes").update({is_active:t}).eq("id",a);if(o)return alert("Failed: "+o.message);r()};window.deleteCode=async function(a,t,n){if(n>0)return confirm(`${t} has already been redeemed ${n} time(s). Deleting it would erase that history, so it will be deactivated instead. Continue?`)?toggleCode(a,!1,t):void 0;if(!confirm(`Delete ${t} permanently?`))return;const{error:o}=await d.from("gift_codes").delete().eq("id",a);if(o)return alert("Failed: "+o.message);r()};r();
