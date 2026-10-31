import{r as l,s as m}from"./supabase-client-BCUvSBAr.js";import{i as p}from"./user-navigation-CnUP_QeE.js";import{f as u}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";let s=[];async function g(){await p({requireSession:!0});const e=await l();if(!e)return;const{data:r,error:t}=await m.from("blog_posts").select("*").eq("user_id",e.user.id).order("created_at",{ascending:!1}),c=document.getElementById("myPostsList");if(t||!r||r.length===0){c.innerHTML=`
          <div class="astra-card" style="text-align: center; padding: 40px;">
            <p style="color: var(--secondary-text); margin-bottom: 12px;">You haven't submitted any posts yet.</p>
            <a href="create-post.html" class="btn-gold">Create Post</a>
          </div>
        `;return}s=r,d(s),document.querySelectorAll(".filter-btn").forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(o=>o.classList.remove("active")),a.classList.add("active");const i=a.dataset.filter;d(i==="all"?s:s.filter(o=>o.status===i))})})}function d(e){const r=document.getElementById("myPostsList");if(e.length===0){r.innerHTML='<div class="astra-card" style="text-align: center; padding: 30px; color: var(--secondary-text);">No posts in this category.</div>';return}r.innerHTML=e.map(t=>`
        <div class="my-post-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="font-size: 1.1rem; color: var(--deep-forest);">${n(t.title)}</h3>
            <span class="badge-status ${t.status==="approved"?"badge-completed":t.status==="pending"?"badge-pending":"badge-failed"}">
              ${t.status}
            </span>
          </div>

          <p style="font-size: 0.88rem; color: var(--secondary-text); margin-bottom: 10px; line-height: 1.4;">
            ${n(t.content.substring(0,140))}${t.content.length>140?"...":""}
          </p>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--secondary-text);">
            <span>Submitted: ${u(t.created_at)}</span>
            ${t.status==="approved"?`
              <a href="post-details.html?id=${t.id}" style="color: var(--primary-green); font-weight: 700; text-decoration: none;">View Live Post →</a>
            `:""}
          </div>

          ${t.status==="rejected"&&t.rejection_reason?`
            <div style="background: #FDE8E8; color: var(--error-red); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.8rem; margin-top: 10px;">
              <strong>Moderator Note:</strong> ${n(t.rejection_reason)}
            </div>
          `:""}
        </div>
      `).join("")}function n(e){return e?e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]):""}g();
