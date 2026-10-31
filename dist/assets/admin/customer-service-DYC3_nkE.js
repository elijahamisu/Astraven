import{s as d}from"../supabase-client-BCUvSBAr.js";import{i as h}from"../admin-navigation-CfdeLVZw.js";import{f as g}from"../formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"../mobile-cards-DX-1T3ZF.js";let f=null,m=[],p=null;async function y(){const a=await h();if(!a)return;f=a.session;const i=document.getElementById("ticketsFeed"),{data:t,error:e}=await d.from("support_tickets").select("*, profiles:user_id(username, full_name)").order("last_message_at",{ascending:!1}).limit(60);if(e||!t||t.length===0){i.innerHTML='<div class="empty-state-box" style="grid-column: 1 / -1;"><p>No support tickets on file.</p></div>';return}m=t,u("all"),document.querySelectorAll(".filter-btn").forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(n=>n.classList.remove("active")),o.classList.add("active"),u(o.dataset.filter)})})}function u(a){const i=document.getElementById("ticketsFeed"),t=m.filter(e=>a==="all"||e.status===a);if(t.length===0){i.innerHTML='<div class="empty-state-box" style="grid-column: 1 / -1;"><p>No tickets match this filter.</p></div>';return}i.innerHTML=t.map(e=>{var r,c;const n=e.status==="resolved"||e.status==="closed"?"badge-completed":e.status==="open"?"badge-pending":"badge-completed",l=((r=e.profiles)==null?void 0:r.username)||"user",s=((c=e.profiles)==null?void 0:c.full_name)||"Investor";return`
          <div class="ticket-card" id="card-${e.id}">
            <div class="card-top-bar">
              <div>
                <span class="ref-code">${e.ticket_ref}</span>
                <span class="ticket-category-pill">${e.category}</span>
              </div>
              <span class="badge-status ${n}">${e.status.replace(/_/g," ")}</span>
            </div>

            <div class="card-body">
              <h2 class="ticket-subject">${v(e.subject)}</h2>

              <div class="investor-meta-row">
                <span>By: <strong>@${l}</strong> (${s})</span>
                <span>${g(e.last_message_at)}</span>
              </div>

              <button class="btn-open-ticket" onclick="openTicket('${e.id}')">
                <span>💬</span>
                <span>Open Conversation &amp; Reply</span>
              </button>
            </div>
          </div>
        `}).join("")}window.openTicket=async function(a){p=a;const i=document.getElementById("chatModal"),t=document.getElementById("modalThread");i.classList.add("active");const e=m.find(s=>s.id===a);e&&(document.getElementById("modalTicketRef").textContent=`${e.ticket_ref} — [${e.category}]`,document.getElementById("modalTicketSubject").textContent=e.subject),t.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 20px;">Loading conversation...</p>';const{data:o,error:n}=await d.from("support_messages").select("*").eq("ticket_id",a).order("created_at",{ascending:!0});if(n||!o||o.length===0){t.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 20px;">No message history found.</p>';return}const l=await Promise.all(o.map(async s=>{let r=null;if(s.attachment_url)try{const{data:c}=await d.storage.from("support-attachments").createSignedUrl(s.attachment_url,3600);r=(c==null?void 0:c.signedUrl)||null}catch(c){console.warn("Failed to load image preview:",c)}return{...s,imageUrl:r}}));t.innerHTML=l.map(s=>{const r=s.is_staff;return`
          <div class="msg-bubble ${r?"staff":"user"}">
            <span style="font-size: 0.72rem; font-weight: 700; color: ${r?"var(--bright-gold)":"var(--primary-green)"}; display: block; margin-bottom: 2px;">
              ${r?"✦ Staff Response":"Investor Message"}
            </span>
            <div>${v(s.message)}</div>

            <!-- Inline Direct Image Display -->
            ${s.imageUrl?`
              <div style="margin-top: 6px;">
                <img src="${s.imageUrl}" alt="Attachment proof" class="msg-inline-img" onclick="window.open('${s.imageUrl}', '_blank')" title="Tap to view full screen">
                <span style="font-size: 0.68rem; color: var(--secondary-text); display: block; margin-top: 3px;">(Tap image to view full screen)</span>
              </div>
            `:""}

            <span style="font-size: 0.68rem; opacity: 0.7; margin-top: 4px; display: block; text-align: right;">${g(s.created_at)}</span>
          </div>
        `}).join(""),t.scrollTop=t.scrollHeight};document.getElementById("closeModalBtn").addEventListener("click",()=>{document.getElementById("chatModal").classList.remove("active")});document.getElementById("modalReplyForm").addEventListener("submit",async a=>{a.preventDefault();const i=document.getElementById("replyMessageInput"),t=document.getElementById("sendReplyBtn"),e=document.getElementById("statusSelect"),o=i.value.trim();if(o){t.disabled=!0,t.textContent="Sending...";try{const{data:n,error:l}=await d.rpc("reply_support_ticket",{p_ticket_id:p,p_sender_id:f.user.id,p_message:o,p_attachment_url:null});if(l||!n.success)throw new Error((n==null?void 0:n.error)||(l==null?void 0:l.message)||"Failed to send reply");const s=e.value;s&&await d.from("support_tickets").update({status:s,updated_at:new Date().toISOString()}).eq("id",p),i.value="",alert("Response dispatched successfully to investor!"),openTicket(p),y()}catch(n){alert(n.message||"Error dispatching reply")}finally{t.disabled=!1,t.textContent="Send Response"}}});function v(a){return a?a.replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]):""}y();
