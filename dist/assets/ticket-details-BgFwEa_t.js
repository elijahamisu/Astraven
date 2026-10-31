import{s as d,r as y}from"./supabase-client-BCUvSBAr.js";import{i as v}from"./user-navigation-FagTkAhj.js";import{f as p}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";let m=null,l=null;async function g(){await v({requireSession:!0});const a=await y();if(!a)return;if(m=a.user.id,l=new URLSearchParams(window.location.search).get("id"),!l){document.getElementById("ticketSummary").innerHTML='<p style="color: var(--error-red);">No ticket specified.</p>';return}const{data:t,error:c}=await d.from("support_tickets").select("*").eq("id",l).maybeSingle();if(c||!t){document.getElementById("ticketSummary").innerHTML='<p style="color: var(--error-red);">Ticket not found or unauthorized.</p>';return}document.getElementById("ticketSummary").innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-family: monospace; font-size: 0.8rem; font-weight: 700; color: var(--metallic-gold);">${t.ticket_ref}</span>
          <span class="badge-status ${t.status==="resolved"?"badge-completed":"badge-pending"}">${t.status.replace(/_/g," ")}</span>
        </div>
        <h2 style="font-size: 1.15rem; color: var(--deep-forest); margin-bottom: 4px;">${u(t.subject)}</h2>
        <span style="font-size: 0.75rem; color: var(--secondary-text);">Category: <strong>${t.category}</strong> | Opened: ${p(t.created_at)}</span>
      `;const{data:r}=await d.from("support_messages").select("*").eq("ticket_id",l).order("created_at",{ascending:!0}),s=document.getElementById("chatThread");if(!r||r.length===0){s.innerHTML='<p style="text-align: center; color: var(--secondary-text);">No messages recorded.</p>';return}const f=await Promise.all(r.map(async e=>{let n=null;if(e.attachment_url)try{const{data:o}=await d.storage.from("support-attachments").createSignedUrl(e.attachment_url,3600);n=(o==null?void 0:o.signedUrl)||null}catch(o){console.warn("Failed to load image preview:",o)}return{...e,imageUrl:n}}));s.innerHTML=f.map(e=>{const n=e.sender_id===m&&!e.is_staff;return`
          <div class="msg-bubble ${n?"user":"staff"}">
            <span style="font-size: 0.72rem; font-weight: 700; color: ${n?"var(--soft-gold)":"var(--primary-green)"}; display: block; margin-bottom: 2px;">
              ${n?"You":"✦ Support Desk Officer"}
            </span>
            <div>${u(e.message)}</div>

            <!-- Direct Image Display -->
            ${e.imageUrl?`
              <div style="margin-top: 6px;">
                <img src="${e.imageUrl}" alt="Attachment preview" class="msg-inline-img" onclick="window.open('${e.imageUrl}', '_blank')" title="Tap to view full screen">
              </div>
            `:""}

            <span class="msg-meta">${p(e.created_at)}</span>
          </div>
        `}).join(""),window.scrollTo(0,document.body.scrollHeight)}document.getElementById("replyForm").addEventListener("submit",async a=>{a.preventDefault();const i=document.getElementById("replyMsg"),t=document.getElementById("sendBtn"),c=i.value.trim();if(!c)return;t.disabled=!0;const{data:r,error:s}=await d.rpc("reply_support_ticket",{p_ticket_id:l,p_sender_id:m,p_message:c,p_attachment_url:null});t.disabled=!1,s||!r.success?alert((r==null?void 0:r.error)||(s==null?void 0:s.message)||"Failed to send reply"):(i.value="",g())});function u(a){return a?a.replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]):""}g();
