import{s as l,r as y}from"./supabase-client-BCUvSBAr.js";import{i as v}from"./user-navigation-FagTkAhj.js";import{f as k}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";let i=null;async function u(){await v({requireSession:!0});const s=await y();if(!s)return;i=s.user.id;const{data:e,error:r}=await l.from("support_tickets").select("*").eq("user_id",i).order("last_message_at",{ascending:!1}),a=document.getElementById("ticketsContainer");if(r||!e||e.length===0){a.innerHTML=`
          <div class="astra-card" style="text-align: center; padding: 40px;">
            <p style="color: var(--secondary-text); margin-bottom: 12px;">You currently have no open or resolved tickets.</p>
            <button class="btn-emerald" onclick="document.getElementById('openModalBtn').click()">Open Your First Ticket</button>
          </div>
        `;return}a.innerHTML=e.map(t=>`
        <a href="ticket-details.html?id=${t.id}" class="ticket-card">
          <div style="min-width: 0; flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-family: monospace; font-size: 0.75rem; color: var(--secondary-text); font-weight: 700;">${t.ticket_ref}</span>
              <span style="font-size: 0.72rem; color: var(--metallic-gold); font-weight: 600;">[${t.category}]</span>
            </div>
            <strong style="font-size: 0.95rem; color: var(--deep-forest); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${b(t.subject)}
            </strong>
            <span style="font-size: 0.75rem; color: var(--secondary-text);">Updated: ${k(t.last_message_at)}</span>
          </div>
          <div>
            <span class="badge-status ${t.status==="resolved"?"badge-completed":t.status==="open"?"badge-pending":"badge-completed"}">
              ${t.status.replace(/_/g," ")}
            </span>
          </div>
        </a>
      `).join("")}const d=document.getElementById("ticketModal");document.getElementById("openModalBtn").addEventListener("click",()=>d.classList.add("active"));document.getElementById("closeModalBtn").addEventListener("click",()=>d.classList.remove("active"));document.getElementById("newTicketForm").addEventListener("submit",async s=>{s.preventDefault();const e=document.getElementById("submitTicketBtn");e.disabled=!0,e.textContent="Submitting Ticket...";const r=document.getElementById("subject").value.trim(),a=document.getElementById("category").value,t=document.getElementById("description").value.trim(),c=document.getElementById("ticketAttachment").files[0];let m=null;try{if(c){const g=c.name.split(".").pop(),p=`${i}/${Date.now()}_att.${g}`,{error:f}=await l.storage.from("support-attachments").upload(p,c);f||(m=p)}const{data:n,error:o}=await l.rpc("create_support_ticket",{p_user_id:i,p_subject:r,p_category:a,p_initial_message:t,p_attachment_url:m});if(o||!n.success)throw new Error((n==null?void 0:n.error)||(o==null?void 0:o.message)||"Submission failed");alert(`Ticket ${n.ticket_ref} opened successfully!`),d.classList.remove("active"),document.getElementById("newTicketForm").reset(),u()}catch(n){alert(n.message)}finally{e.disabled=!1,e.textContent="Submit Ticket"}});function b(s){return s?s.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]):""}u();
