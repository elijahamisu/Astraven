import{s as l}from"../supabase-client-BCUvSBAr.js";import{i as y}from"../admin-navigation-CfdeLVZw.js";import{f as g}from"../formatters-kkpPVsns.js";import{f as _}from"../usernames-CpnWIWI3.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"../mobile-cards-DX-1T3ZF.js";let m=null,d=[];async function p(){const n=await y();if(!n)return;m=n.session;const t=document.getElementById("postsModFeed"),{data:s,error:e}=await l.from("blog_posts").select("*, profiles:user_id(username, full_name)").order("created_at",{ascending:!1}).limit(60);if(e||!s||s.length===0){t.innerHTML='<div class="empty-state-box" style="grid-column: 1 / -1;"><p>No community submissions found.</p></div>';return}d=s,c("all"),document.querySelectorAll(".filter-btn").forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(r=>r.classList.remove("active")),o.classList.add("active"),c(o.dataset.filter)})})}function c(n){const t=document.getElementById("postsModFeed"),s=d.filter(e=>n==="all"||e.status===n);if(s.length===0){t.innerHTML='<div class="empty-state-box" style="grid-column: 1 / -1;"><p>No posts match this filter.</p></div>';return}t.innerHTML=s.map(e=>{var u;const o=e.status==="pending",r=e.status==="approved",a=r?"badge-completed":o?"badge-pending":"badge-failed",b=((u=e.profiles)==null?void 0:u.username)||"user";return`
          <div class="mod-card" id="card-${e.id}">
            <!-- Top Bar -->
            <div class="card-top-bar">
              <div>
                <span class="author-handle">@${b}</span>
                <span class="post-date">${g(e.created_at)}</span>
              </div>
              <span class="badge-status ${a}">
                ${e.status.toUpperCase()}
              </span>
            </div>

            <!-- Body -->
            <div class="card-body">
              <h2 class="post-title">${i(e.title)}</h2>
              <p class="post-content">${i(e.content)}</p>

              <!-- Inline Screenshot Preview -->
              ${[e.image_url,e.image_url_2].filter(Boolean).map(f=>`
                <div class="proof-image-container">
                  <img src="${f}" alt="Post picture" class="proof-img" onclick="window.open('${f}', '_blank')">
                  <span class="proof-caption">🔍 Tap picture to view full resolution</span>
                </div>
              `).join("")}

              ${e.caption?`
                <p style="font-size: 0.8rem; color: var(--secondary-text); font-style: italic;">"${i(e.caption)}"</p>
              `:""}

              ${e.bonus_awarded?`
                <div style="background: var(--light-gold-bg); border: 1px solid var(--metallic-gold); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 700; color: var(--primary-green); margin-top: 8px;">
                  ✦ Platform Bonus Awarded: ₦${Number(e.bonus_amount).toLocaleString()}
                </div>
              `:""}

              ${e.rejection_reason?`
                <div style="background: #FDE8E8; border: 1px solid var(--error-red); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--error-red); margin-top: 8px;">
                  <strong>Rejection Note:</strong> ${i(e.rejection_reason)}
                </div>
              `:""}
            </div>

            <!-- Action Buttons: Approve, Reject, and Always-Available Delete -->
            <div class="card-actions-row">
              ${o?`
                <button class="btn-approve-mod" onclick="moderatePost('${e.id}', 'approved')">
                  <span>✓</span>
                  <span>Approve &amp; Bonus</span>
                </button>
                <button class="btn-reject-mod" onclick="moderatePost('${e.id}', 'rejected')">
                  <span>✕</span>
                  <span>Reject</span>
                </button>
              `:""}

              ${r?`
                <button class="btn-approve-mod" style="flex: 1; width: 100%;" onclick="openComments('${e.id}')">
                  <span>💬</span>
                  <span>Comments (${Number(e.comments_count)||0})</span>
                </button>
              `:""}
              <!-- Delete button is available on EVERY post (before or after approval) -->
              <button class="btn-delete-mod" style="${o?"":"flex: 1; width: 100%;"}" onclick="deletePost('${e.id}')">
                <span>🗑️</span>
                <span>Delete Post</span>
              </button>
            </div>
          </div>
        `}).join("")}window.moderatePost=async function(n,t){let s=0,e=null;if(t==="approved"){const o=prompt("Optional posting bonus amount to credit to investor wallet (₦, enter 0 for none):","500");if(o===null)return;s=Number(o)||0}else if(e=prompt("Enter rejection reason:"),!e)return;try{const{data:o,error:r}=await l.rpc("admin_moderate_post",{p_admin_id:m.user.id,p_post_id:n,p_decision:t,p_rejection_reason:e,p_bonus_amount:s});r||!(o!=null&&o.success)?alert("Moderation failed: "+((o==null?void 0:o.error)||(r==null?void 0:r.message)||"Error")):(alert(`Post ${t} successfully!`),p())}catch(o){alert("Action error: "+o.message)}};window.deletePost=async function(n){if(confirm("Are you sure you want to permanently delete this community post? It will be removed from the public feed immediately."))try{const{data:t,error:s}=await l.rpc("admin_delete_blog_post",{p_admin_id:m.user.id,p_post_id:n});s||!(t!=null&&t.success)?alert("Deletion error: "+((t==null?void 0:t.error)||(s==null?void 0:s.message)||"Failed")):(alert("Post permanently deleted!"),p())}catch(t){alert("Error deleting post: "+t.message)}};let v=null;window.openComments=async function(n){v=n;const t=d.find(a=>a.id===n);document.getElementById("cmTitle").textContent=t?t.title:"Comments",document.getElementById("commentsModal").style.display="flex";const s=document.getElementById("cmList");s.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 16px;">Loading comments...</p>';const{data:e,error:o}=await l.from("blog_comments").select("id, user_id, comment, created_at").eq("post_id",n).order("created_at",{ascending:!1});if(o){s.innerHTML=`<p style="color: var(--error-red); padding: 16px;">${i(o.message)}</p>`;return}if(!e.length){s.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 16px;">No comments on this post.</p>';return}const r=await _(e.map(a=>a.user_id));s.innerHTML=e.map(a=>`
        <div id="cm-${a.id}" style="display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #ECECEC;">
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 0.78rem;"><strong>@${i(r.get(a.user_id)||"user")}</strong> <span style="color: var(--secondary-text);">${g(a.created_at)}</span></div>
            <div style="font-size: 0.88rem; margin-top: 3px; overflow-wrap: anywhere;">${i(a.comment)}</div>
          </div>
          <button onclick="deleteComment('${a.id}')" style="flex-shrink: 0; border: 1px solid var(--error-red); color: var(--error-red); background: rgba(215,25,32,.06); border-radius: 6px; padding: 5px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">Delete</button>
        </div>`).join("")};window.deleteComment=async function(n){var o;if(!confirm("Delete this comment?"))return;const{error:t,count:s}=await l.from("blog_comments").delete({count:"exact"}).eq("id",n);if(t||!s)return alert("Could not delete: "+((t==null?void 0:t.message)||"not allowed"));(o=document.getElementById(`cm-${n}`))==null||o.remove();const e=d.find(r=>r.id===v);e&&(e.comments_count=Math.max(0,(Number(e.comments_count)||1)-1))};window.closeComments=function(){document.getElementById("commentsModal").style.display="none";const n=document.querySelector(".filter-btn.active");c(n?n.dataset.filter:"all")};function i(n){return n?n.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}p();
