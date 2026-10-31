import{s as m,r as g}from"./supabase-client-BCUvSBAr.js";import{i as f}from"./user-navigation-C7tDwe5x.js";import{f as d}from"./usernames-CpnWIWI3.js";import{f as l}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-1MPb4jkf.js";import"./mobile-cards-DX-1T3ZF.js";let p=null,a=null;async function y(){await f({requireSession:!0});const n=await g();if(!n)return;p=n.user.id,a=new URLSearchParams(window.location.search).get("id");const o=document.getElementById("postContentCard");if(!a){o.innerHTML='<p style="color: var(--error-red); text-align: center;">No post identifier provided.</p>';return}const{data:e,error:r}=await m.from("blog_posts").select(`
          id, user_id, title, content, caption, image_url, image_url_2, likes_count, comments_count, bonus_awarded, created_at
        `).eq("id",a).maybeSingle();if(r||!e){o.innerHTML='<p style="color: var(--error-red); text-align: center;">Post not found or pending review.</p>';return}const i=(await d([e.user_id])).get(e.user_id)||"Investor";o.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <strong style="color: var(--deep-forest); font-size: 1rem;">@${s(i)}</strong>
            <span style="font-size: 0.75rem; color: var(--secondary-text); display: block;">${l(e.created_at)}</span>
          </div>
          ${e.bonus_awarded?'<span class="badge-status badge-completed">✦ Verified Bonus Awarded</span>':""}
        </div>

        <h1 style="font-size: 1.4rem; color: var(--deep-forest); margin-bottom: 12px;">${s(e.title)}</h1>
        <p style="font-size: 0.95rem; color: var(--primary-text); line-height: 1.6; white-space: pre-wrap;">${s(e.content)}</p>

        ${[e.image_url,e.image_url_2].filter(Boolean).map(c=>`
          <img src="${c}" alt="Post picture" style="width: 100%; max-height: 440px; object-fit: contain; border-radius: var(--radius-sm); border: 1px solid #E5E7EB; margin-top: 14px; background: #000; cursor: pointer;" onclick="window.open('${c}', '_blank')">
        `).join("")}

        ${e.caption?`
          <p style="font-size: 0.85rem; color: var(--secondary-text); font-style: italic; margin-top: 10px;">"${s(e.caption)}"</p>
        `:""}
      `,u()}async function u(){const n=document.getElementById("commentsList"),{data:t,error:o}=await m.from("blog_comments").select("id, user_id, comment, created_at").eq("post_id",a).order("created_at",{ascending:!1});if(o||!t||t.length===0){document.getElementById("commentsHeading").textContent="Discussion & Comments (0)",n.innerHTML='<p style="text-align: center; color: var(--secondary-text); font-size: 0.85rem; padding: 14px;">No comments yet. Share your thoughts above!</p>';return}document.getElementById("commentsHeading").textContent=`Discussion & Comments (${t.length})`;const e=await d(t.map(r=>r.user_id));n.innerHTML=t.map(r=>{const i=e.get(r.user_id)||"Investor";return`
          <div class="comment-item">
            <div class="comment-author-row">
              <span class="comment-author">@${s(i)}</span>
              <span class="comment-time">${l(r.created_at)}</span>
            </div>
            <div class="comment-text">${s(r.comment)}</div>
          </div>
        `}).join("")}document.getElementById("commentForm").addEventListener("submit",async n=>{n.preventDefault();const t=document.getElementById("commentInput"),o=document.getElementById("commentBtn"),e=t.value.trim();if(!e)return;o.disabled=!0,o.textContent="Posting...";const{error:r}=await m.from("blog_comments").insert({post_id:a,user_id:p,comment:e});o.disabled=!1,o.textContent="Send",r?alert("Failed to post comment: "+r.message):(t.value="",u())});function s(n){return n?n.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}y();
