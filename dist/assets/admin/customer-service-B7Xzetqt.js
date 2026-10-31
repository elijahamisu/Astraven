import{s as p}from"../supabase-client-DdZx35sm.js";import{i as k}from"../admin-navigation-Ck9BqSXZ.js";import{f as y}from"../formatters-kkpPVsns.js";import"../mobile-cards-DX-1T3ZF.js";let v=null,u=[],c=null;async function g(){const s=await k();if(!s)return;v=s.session;const n=document.getElementById("ticketsFeed"),{data:t,error:e}=await p.from("support_tickets").select("*, profiles:user_id(username, full_name)").order("last_message_at",{ascending:!1}).limit(60);if(e||!t||t.length===0){n.innerHTML='<div class="empty-state-box" style="grid-column: 1 / -1;"><p>No support tickets on file.</p></div>';return}u=t,f("all"),document.querySelectorAll(".filter-btn").forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(i=>i.classList.remove("active")),a.classList.add("active"),f(a.dataset.filter)})})}function f(s){const n=document.getElementById("ticketsFeed"),t=u.filter(e=>s==="all"||e.status===s||s==="ended"&&["closed","resolved"].includes(e.status));if(t.length===0){n.innerHTML='<div class="empty-state-box" style="grid-column: 1 / -1;"><p>No tickets match this filter.</p></div>';return}n.innerHTML=t.map(e=>{var o,l;const a=e.status==="resolved"||e.status==="closed",i=a?"badge-completed":e.status==="open"?"badge-pending":"badge-completed",r=((o=e.profiles)==null?void 0:o.username)||"user",d=((l=e.profiles)==null?void 0:l.full_name)||"Investor";return`
          <div class="ticket-card" id="card-${e.id}">
            <div class="card-top-bar">
              <div>
                <span class="ref-code">${e.ticket_ref}</span>
                <span class="ticket-category-pill">${e.category}</span>
              </div>
              <span class="badge-status ${a?"badge-failed":i}">${a?"ended":e.status.replace(/_/g," ")}</span>
            </div>

            <div class="card-body">
              <h2 class="ticket-subject">${b(e.subject)}</h2>

              <div class="investor-meta-row">
                <span>By: <strong>@${r}</strong> (${d})</span>
                <span>${y(e.last_message_at)}</span>
              </div>

              <button class="btn-open-ticket" onclick="openTicket('${e.id}')">
                <span>💬</span>
                <span>Open Conversation &amp; Reply</span>
              </button>
            </div>
          </div>
        `}).join("")}window.openTicket=async function(s){c=s;const n=document.getElementById("chatModal"),t=document.getElementById("modalThread");n.classList.add("active");const e=u.find(o=>o.id===s),a=e&&["closed","resolved"].includes(e.status);document.getElementById("modalReplyForm").style.display=a?"none":"",document.getElementById("endSessionBar").style.display=a?"none":"",document.getElementById("endedNote").style.display=a?"block":"none",e&&(document.getElementById("modalTicketRef").textContent=`${e.ticket_ref} — [${e.category}]`,document.getElementById("modalTicketSubject").textContent=e.subject),t.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 20px;">Loading conversation...</p>';const{data:i,error:r}=await p.from("support_messages").select("*").eq("ticket_id",s).order("created_at",{ascending:!0});if(r||!i||i.length===0){t.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 20px;">No message history found.</p>';return}const d=await Promise.all(i.map(async o=>{let l=null;if(o.attachment_url)try{const{data:m}=await p.storage.from("support-attachments").createSignedUrl(o.attachment_url,3600);l=(m==null?void 0:m.signedUrl)||null}catch(m){console.warn("Failed to load image preview:",m)}return{...o,imageUrl:l}}));t.innerHTML=d.map(o=>{const l=o.is_staff;return`
          <div class="msg-bubble ${l?"staff":"user"}">
            <span style="font-size: 0.72rem; font-weight: 700; color: ${l?"var(--bright-gold)":"var(--primary-green)"}; display: block; margin-bottom: 2px;">
              ${l?"✦ Staff Response":"Investor Message"}
            </span>
            <div>${b(o.message)}</div>

            <!-- Inline Direct Image Display -->
            ${o.imageUrl?`
              <div style="margin-top: 6px;">
                <img src="${o.imageUrl}" alt="Attachment proof" class="msg-inline-img" onclick="window.open('${o.imageUrl}', '_blank')" title="Tap to view full screen">
                <span style="font-size: 0.68rem; color: var(--secondary-text); display: block; margin-top: 3px;">(Tap image to view full screen)</span>
              </div>
            `:""}

            <span style="font-size: 0.68rem; opacity: 0.7; margin-top: 4px; display: block; text-align: right;">${y(o.created_at)}</span>
          </div>
        `}).join(""),t.scrollTop=t.scrollHeight};document.getElementById("endSessionBtn").addEventListener("click",async()=>{if(!c||!confirm("End this session? The user will not be able to send messages here anymore and must start a new session."))return;const s=document.getElementById("endSessionBtn");s.disabled=!0,s.textContent="Ending...";const{data:n,error:t}=await p.rpc("end_support_ticket",{p_ticket_id:c});if(s.disabled=!1,s.textContent="End Session",t||!(n!=null&&n.success))return alert((n==null?void 0:n.error)||(t==null?void 0:t.message)||"Could not end session.");const e=u.find(a=>a.id===c);e&&(e.status="closed"),await openTicket(c),g()});document.getElementById("closeModalBtn").addEventListener("click",()=>{document.getElementById("chatModal").classList.remove("active")});document.getElementById("modalReplyForm").addEventListener("submit",async s=>{s.preventDefault();const n=document.getElementById("replyMessageInput"),t=document.getElementById("sendReplyBtn"),e=document.getElementById("statusSelect"),a=n.value.trim();if(a){t.disabled=!0,t.textContent="Sending...";try{const{data:i,error:r}=await p.rpc("reply_support_ticket",{p_ticket_id:c,p_sender_id:v.user.id,p_message:a,p_attachment_url:null});if(r||!(i!=null&&i.success))throw new Error((i==null?void 0:i.error)||(r==null?void 0:r.message)||"Failed to send reply");const d=e.value;d&&d!=="waiting_for_user"&&await p.from("support_tickets").update({status:d,updated_at:new Date().toISOString()}).eq("id",c),n.value="",alert("Response dispatched successfully to investor!"),openTicket(c),g()}catch(i){alert(i.message||"Error dispatching reply")}finally{t.disabled=!1,t.textContent="Send Response"}}});function b(s){return s?s.replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]):""}g();
