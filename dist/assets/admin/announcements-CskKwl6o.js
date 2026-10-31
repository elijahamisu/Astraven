import{s as r}from"../supabase-client-BCUvSBAr.js";import{i}from"../admin-navigation-CfdeLVZw.js";import{f as d}from"../formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"../mobile-cards-DX-1T3ZF.js";async function s(){if(!await i())return;const{data:e,error:a}=await r.from("announcements").select("*").order("created_at",{ascending:!1}),n=document.getElementById("annListContainer");if(a||!e||e.length===0){n.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 40px;">No notices published.</p>';return}n.innerHTML=`
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 500px;">
          <thead>
            <tr style="background: #FAFAFA; text-align: left; color: var(--secondary-text); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 12px;">Category / Title</th>
              <th style="padding: 12px;">Date</th>
              <th style="padding: 12px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(t=>`
              <tr style="border-bottom: 1px solid #ECECEC;">
                <td style="padding: 12px;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: var(--metallic-gold);">${t.category}</span>
                  <div style="font-weight: 700; color: var(--deep-forest);">${t.title}</div>
                </td>
                <td style="padding: 12px; color: var(--secondary-text); font-size: 0.75rem;">${d(t.created_at)}</td>
                <td style="padding: 12px;"><span class="badge-status badge-completed">Published</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}document.getElementById("annForm").addEventListener("submit",async o=>{o.preventDefault();const e=document.getElementById("annTitle").value.trim(),a=document.getElementById("annContent").value.trim(),n=document.getElementById("annCategory").value,{error:t}=await r.from("announcements").insert({title:e,content:a,category:n,is_active:!0,priority:1});t?alert(t.message):(alert("Notice published!"),document.getElementById("annForm").reset(),s())});s();
