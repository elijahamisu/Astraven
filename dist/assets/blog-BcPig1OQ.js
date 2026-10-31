import{s as l,r as f}from"./supabase-client-DdZx35sm.js";import{i as _}from"./user-navigation-mqSLN6Ik.js";import{f as y}from"./usernames-B9ARDZtj.js";import{f as v}from"./formatters-kkpPVsns.js";import"./site-settings-CjsVQood.js";import"./mobile-cards-DX-1T3ZF.js";let c=null;async function h(){await _({requireSession:!0});const o=await f();if(!o)return;c=o.user.id;const{data:e,error:r}=await l.from("blog_posts").select(`
          id, user_id, title, content, caption, image_url, image_url_2, likes_count, comments_count, bonus_awarded, created_at
        `).eq("status","approved").order("created_at",{ascending:!1}).limit(30),a=document.getElementById("postsFeedContainer");if(r||!e||e.length===0){a.innerHTML=`
          <div class="astra-card" style="text-align: center; padding: 48px 16px;">
            <div style="font-size: 2.2rem; margin-bottom: 8px; opacity: 0.6;">📰</div>
            <h3 style="margin-bottom: 6px;">No Community Posts Yet</h3>
            <p style="color: var(--secondary-text); font-size: 0.9rem; margin-bottom: 16px;">
              Be the first investor to share your withdrawal receipt or operational milestone!
            </p>
            <a href="create-post.html" class="btn-gold">Create Community Post</a>
          </div>
        `;return}const{data:i}=await l.from("blog_likes").select("post_id").eq("user_id",c),s=new Set((i||[]).map(t=>t.post_id)),d=await y(e.map(t=>t.user_id));a.innerHTML=e.map(t=>{const m=d.get(t.user_id)?"@"+d.get(t.user_id):"Investor",p=s.has(t.id),u=Number(t.comments_count)||0;return`
          <div class="post-card" id="post-${t.id}">
            <div class="post-author-row">
              <div class="author-avatar">${m.replace("@","").charAt(0).toUpperCase()}</div>
              <div>
                <strong style="font-size: 0.95rem; color: var(--deep-forest); display: block;">${n(m)}</strong>
                <span style="font-size: 0.75rem; color: var(--secondary-text);">${v(t.created_at)}</span>
              </div>
              ${t.bonus_awarded?`
                <span class="badge-status badge-completed" style="margin-left: auto;">✦ Verified Bonus Awarded</span>
              `:""}
            </div>

            <h2 style="font-size: 1.25rem; color: var(--deep-forest); margin-bottom: 8px;">${n(t.title)}</h2>
            <p style="font-size: 0.9rem; color: var(--primary-text); line-height: 1.5; white-space: pre-wrap;">${n(t.content)}</p>

            ${[t.image_url,t.image_url_2].filter(Boolean).length?`
              <div style="display: grid; grid-template-columns: repeat(${[t.image_url,t.image_url_2].filter(Boolean).length}, minmax(0, 1fr)); gap: 8px;">
                ${[t.image_url,t.image_url_2].filter(Boolean).map(g=>`<img src="${g}" alt="Post picture" class="post-image-preview" loading="lazy" onclick="window.open('${g}', '_blank')">`).join("")}
              </div>
            `:""}

            ${t.caption?`
              <p style="font-size: 0.85rem; color: var(--secondary-text); font-style: italic; margin-top: 6px;">
                "${n(t.caption)}"
              </p>
            `:""}

            <div class="post-actions-bar">
              <button class="action-interactive-btn ${p?"liked":""}" onclick="toggleLike('${t.id}')">
                <span>${p?"❤️":"🤍"}</span>
                <span id="like-count-${t.id}">${t.likes_count||0}</span>
              </button>
              <a href="post-details.html?id=${t.id}" class="action-interactive-btn" style="text-decoration: none;">
                <span>💬</span>
                <span>${u} ${u===1?"Comment":"Comments"}</span>
              </a>
              <a href="post-details.html?id=${t.id}" style="margin-left: auto; font-size: 0.85rem; color: var(--primary-green); font-weight: 700; text-decoration: none;">
                View Post →
              </a>
            </div>
          </div>
        `}).join("")}window.toggleLike=async function(o){const{data:e,error:r}=await l.rpc("toggle_blog_like",{p_post_id:o,p_user_id:c});if(!r&&e.success){const a=document.getElementById(`like-count-${o}`);a&&(a.textContent=e.likes_count);const i=document.getElementById(`post-${o}`),s=i==null?void 0:i.querySelector(".action-interactive-btn");s&&(s.classList.toggle("liked",e.liked),s.querySelector("span").textContent=e.liked?"❤️":"🤍")}};function n(o){return o?o.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]):""}h();
