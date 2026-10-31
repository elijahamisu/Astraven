import{s as d,r as f}from"./supabase-client-BCUvSBAr.js";import{i as v}from"./user-navigation-CnUP_QeE.js";import{f as u}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";let m=null,l=null;async function p(){await v({requireSession:!0});const s=await f();if(!s)return;if(m=s.user.id,l=new URLSearchParams(window.location.search).get("id"),!l){const e=["closed","resolved"].includes(r.status);document.getElementById("replyForm").style.display=e?"none":"",document.getElementById("endedBar").style.display=e?"block":"none",document.getElementById("ticketSummary").innerHTML='<p style="color: var(--error-red);">No ticket specified.</p>';return}const{data:r,error:c}=await d.from("support_tickets").select("*").eq("id",l).maybeSingle();if(c||!r){document.getElementById("ticketSummary").innerHTML='<p style="color: var(--error-red);">Ticket not found or unauthorized.</p>';return}document.getElementById("ticketSummary").innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-family: monospace; font-size: 0.8rem; font-weight: 700; color: var(--metallic-gold);">${r.ticket_ref}</span>
          <span class="badge-status ${ended?"badge-failed":"badge-pending"}">${ended?"session ended":r.status.replace(/_/g," ")}</span>
        </div>
        <h2 style="font-size: 1.15rem; color: var(--deep-forest); margin-bottom: 4px;">${g(r.subject)}</h2>
        <span style="font-size: 0.75rem; color: var(--secondary-text);">Category: <strong>${r.category}</strong> | Opened: ${u(r.created_at)}</span>
      `;const{data:t}=await d.from("support_messages").select("*").eq("ticket_id",l).order("created_at",{ascending:!0}),n=document.getElementById("chatThread");if(!t||t.length===0){n.innerHTML='<p style="text-align: center; color: var(--secondary-text);">No messages recorded.</p>';return}const y=await Promise.all(t.map(async e=>{let a=null;if(e.attachment_url)try{const{data:o}=await d.storage.from("support-attachments").createSignedUrl(e.attachment_url,3600);a=(o==null?void 0:o.signedUrl)||null}catch(o){console.warn("Failed to load image preview:",o)}return{...e,imageUrl:a}}));n.innerHTML=y.map(e=>{const a=e.sender_id===m&&!e.is_staff;return`
          <div class="msg-bubble ${a?"user":"staff"}">
            <span style="font-size: 0.72rem; font-weight: 700; color: ${a?"var(--soft-gold)":"var(--primary-green)"}; display: block; margin-bottom: 2px;">
              ${a?"You":"✦ Support Desk Officer"}
            </span>
            <div>${g(e.message)}</div>

            <!-- Direct Image Display -->
            ${e.imageUrl?`
              <div style="margin-top: 6px;">
                <img src="${e.imageUrl}" alt="Attachment preview" class="msg-inline-img" onclick="window.open('${e.imageUrl}', '_blank')" title="Tap to view full screen">
              </div>
            `:""}

            <span class="msg-meta">${u(e.created_at)}</span>
          </div>
        `}).join(""),window.scrollTo(0,document.body.scrollHeight)}document.getElementById("replyForm").addEventListener("submit",async s=>{s.preventDefault();const i=document.getElementById("replyMsg"),r=document.getElementById("sendBtn"),c=i.value.trim();if(!c)return;r.disabled=!0;const{data:t,error:n}=await d.rpc("reply_support_ticket",{p_ticket_id:l,p_sender_id:m,p_message:c,p_attachment_url:null});r.disabled=!1,n||!(t!=null&&t.success)?(alert((t==null?void 0:t.error)||(n==null?void 0:n.message)||"Failed to send reply"),t!=null&&t.ended&&p()):(i.value="",p())});function g(s){return s?s.replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]):""}p();
