import{s as l,r as y}from"./supabase-client-BCUvSBAr.js";import{i as v}from"./user-navigation-CnUP_QeE.js";import{f as k}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";let i=null;async function p(){await v({requireSession:!0});const t=await y();if(!t)return;i=t.user.id;const{data:s,error:r}=await l.from("support_tickets").select("*").eq("user_id",i).order("last_message_at",{ascending:!1}),a=document.getElementById("ticketsContainer");if(r||!s||s.length===0){a.innerHTML=`
          <div class="astra-card" style="text-align: center; padding: 40px;">
            <p style="color: var(--secondary-text); margin-bottom: 12px;">You currently have no open or resolved tickets.</p>
            <button class="btn-emerald" onclick="document.getElementById('openModalBtn').click()">Open Your First Ticket</button>
          </div>
        `;return}a.innerHTML=s.map(e=>`
        <a href="ticket-details.html?id=${e.id}" class="ticket-card">
          <div style="min-width: 0; flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-family: monospace; font-size: 0.75rem; color: var(--secondary-text); font-weight: 700;">${e.ticket_ref}</span>
              <span style="font-size: 0.72rem; color: var(--metallic-gold); font-weight: 600;">[${e.category}]</span>
            </div>
            <strong style="font-size: 0.95rem; color: var(--deep-forest); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${b(e.subject)}
            </strong>
            <span style="font-size: 0.75rem; color: var(--secondary-text);">Updated: ${k(e.last_message_at)}</span>
          </div>
          <div>
            <span class="badge-status ${["closed","resolved"].includes(e.status)?"badge-failed":e.status==="open"?"badge-pending":"badge-completed"}">
              ${["closed","resolved"].includes(e.status)?"session ended":e.status.replace(/_/g," ")}
            </span>
          </div>
        </a>
      `).join("")}const d=document.getElementById("ticketModal");document.getElementById("openModalBtn").addEventListener("click",()=>d.classList.add("active"));document.getElementById("closeModalBtn").addEventListener("click",()=>d.classList.remove("active"));document.getElementById("newTicketForm").addEventListener("submit",async t=>{t.preventDefault();const s=document.getElementById("submitTicketBtn");s.disabled=!0,s.textContent="Submitting Ticket...";const r=document.getElementById("subject").value.trim(),a=document.getElementById("category").value,e=document.getElementById("description").value.trim(),c=document.getElementById("ticketAttachment").files[0];let m=null;try{if(c){const g=c.name.split(".").pop(),u=`${i}/${Date.now()}_att.${g}`,{error:f}=await l.storage.from("support-attachments").upload(u,c);f||(m=u)}const{data:n,error:o}=await l.rpc("create_support_ticket",{p_user_id:i,p_subject:r,p_category:a,p_initial_message:e,p_attachment_url:m});if(o||!n.success)throw new Error((n==null?void 0:n.error)||(o==null?void 0:o.message)||"Submission failed");alert(`Ticket ${n.ticket_ref} opened successfully!`),d.classList.remove("active"),document.getElementById("newTicketForm").reset(),p()}catch(n){alert(n.message)}finally{s.disabled=!1,s.textContent="Submit Ticket"}});function b(t){return t?t.replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s]):""}p();new URLSearchParams(location.search).get("new")==="1"&&setTimeout(()=>{var t;return(t=document.getElementById("openModalBtn"))==null?void 0:t.click()},400);
