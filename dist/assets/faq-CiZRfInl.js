import{s as l}from"./supabase-client-DdZx35sm.js";import{i as u}from"./user-navigation-mqSLN6Ik.js";import"./site-settings-CjsVQood.js";import"./mobile-cards-DX-1T3ZF.js";let r=[];async function g(){await u({requireSession:!1});const{data:e,error:t}=await l.from("faqs").select("*").eq("is_active",!0).order("display_order",{ascending:!0}),n=document.getElementById("faqList");if(t||!e||e.length===0){n.innerHTML='<p style="text-align: center; color: var(--secondary-text);">No FAQ entries found.</p>';return}r=e,s(r),document.getElementById("faqSearch").addEventListener("input",c=>{const o=c.target.value.toLowerCase().trim(),d=r.filter(a=>a.question.toLowerCase().includes(o)||a.answer.toLowerCase().includes(o)||a.category.toLowerCase().includes(o));s(d)})}function s(e){const t=document.getElementById("faqList");if(e.length===0){t.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 20px;">No questions match your query.</p>';return}t.innerHTML=e.map(n=>`
        <div class="accordion-item" id="faq-${n.id}">
          <button class="accordion-trigger" type="button" onclick="toggleFaq('${n.id}')">
            <span>${i(n.question)}</span>
            <span class="chevron">▼</span>
          </button>
          <div class="accordion-body">
            <div style="font-size: 0.72rem; color: var(--metallic-gold); font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
              ${i(n.category)}
            </div>
            ${i(n.answer)}
          </div>
        </div>
      `).join("")}window.toggleFaq=function(e){const t=document.getElementById(`faq-${e}`);t&&t.classList.toggle("active")};function i(e){return e?e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}g();
