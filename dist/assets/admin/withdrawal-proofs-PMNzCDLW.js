import{s as i}from"../supabase-client-DdZx35sm.js";import{i as v}from"../admin-navigation-Ck9BqSXZ.js";import{f as g}from"../formatters-kkpPVsns.js";import"../mobile-cards-DX-1T3ZF.js";let l=null,u=[];async function d(){const r=await v();if(!r)return;l=r.session;const t=document.getElementById("postsModFeed"),{data:s,error:e}=await i.from("blog_posts").select("*, profiles:user_id(username, full_name)").order("created_at",{ascending:!1}).limit(60);if(e||!s||s.length===0){t.innerHTML='<div class="empty-state-box" style="grid-column: 1 / -1;"><p>No community submissions found.</p></div>';return}u=s,p("all"),document.querySelectorAll(".filter-btn").forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(n=>n.classList.remove("active")),o.classList.add("active"),p(o.dataset.filter)})})}function p(r){const t=document.getElementById("postsModFeed"),s=u.filter(e=>r==="all"||e.status===r);if(s.length===0){t.innerHTML='<div class="empty-state-box" style="grid-column: 1 / -1;"><p>No posts match this filter.</p></div>';return}t.innerHTML=s.map(e=>{var c;const o=e.status==="pending",m=e.status==="approved"?"badge-completed":o?"badge-pending":"badge-failed",f=((c=e.profiles)==null?void 0:c.username)||"user";return`
          <div class="mod-card" id="card-${e.id}">
            <!-- Top Bar -->
            <div class="card-top-bar">
              <div>
                <span class="author-handle">@${f}</span>
                <span class="post-date">${g(e.created_at)}</span>
              </div>
              <span class="badge-status ${m}">
                ${e.status.toUpperCase()}
              </span>
            </div>

            <!-- Body -->
            <div class="card-body">
              <h2 class="post-title">${a(e.title)}</h2>
              <p class="post-content">${a(e.content)}</p>

              <!-- Inline Screenshot Preview -->
              ${e.image_url?`
                <div class="proof-image-container">
                  <img src="${e.image_url}" alt="Payment Proof" class="proof-img" onclick="window.open('${e.image_url}', '_blank')">
                  <span class="proof-caption">🔍 Tap screenshot to view full resolution</span>
                </div>
              `:""}

              ${e.caption?`
                <p style="font-size: 0.8rem; color: var(--secondary-text); font-style: italic;">"${a(e.caption)}"</p>
              `:""}

              ${e.bonus_awarded?`
                <div style="background: var(--light-gold-bg); border: 1px solid var(--metallic-gold); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 700; color: var(--primary-green); margin-top: 8px;">
                  ✦ Platform Bonus Awarded: ₦${Number(e.bonus_amount).toLocaleString()}
                </div>
              `:""}

              ${e.rejection_reason?`
                <div style="background: #FDE8E8; border: 1px solid var(--error-red); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--error-red); margin-top: 8px;">
                  <strong>Rejection Note:</strong> ${a(e.rejection_reason)}
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

              <!-- Delete button is available on EVERY post (before or after approval) -->
              <button class="btn-delete-mod" style="${o?"":"flex: 1; width: 100%;"}" onclick="deletePost('${e.id}')">
                <span>🗑️</span>
                <span>Delete Post</span>
              </button>
            </div>
          </div>
        `}).join("")}window.moderatePost=async function(r,t){let s=0,e=null;if(t==="approved"){const o=prompt("Optional posting bonus amount to credit to investor wallet (₦, enter 0 for none):","500");if(o===null)return;s=Number(o)||0}else if(e=prompt("Enter rejection reason:"),!e)return;try{const{data:o,error:n}=await i.rpc("admin_moderate_post",{p_admin_id:l.user.id,p_post_id:r,p_decision:t,p_rejection_reason:e,p_bonus_amount:s});n||!(o!=null&&o.success)?alert("Moderation failed: "+((o==null?void 0:o.error)||(n==null?void 0:n.message)||"Error")):(alert(`Post ${t} successfully!`),d())}catch(o){alert("Action error: "+o.message)}};window.deletePost=async function(r){if(confirm("Are you sure you want to permanently delete this community post? It will be removed from the public feed immediately."))try{const{data:t,error:s}=await i.rpc("admin_delete_blog_post",{p_admin_id:l.user.id,p_post_id:r});s||!(t!=null&&t.success)?alert("Deletion error: "+((t==null?void 0:t.error)||(s==null?void 0:s.message)||"Failed")):(alert("Post permanently deleted!"),d())}catch(t){alert("Error deleting post: "+t.message)}};function a(r){return r?r.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}d();
