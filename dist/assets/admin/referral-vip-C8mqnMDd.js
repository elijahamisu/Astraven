import{s}from"../supabase-client-DdZx35sm.js";import{i as g}from"../admin-navigation-Ck9BqSXZ.js";import{a as r}from"../formatters-kkpPVsns.js";import"../mobile-cards-DX-1T3ZF.js";let o=null,m=[];async function c(){const a=await g();if(!a)return;o=a.session;const e=document.getElementById("tiersFeed"),{data:i,error:n}=await s.from("referral_vip_levels").select("*").order("level",{ascending:!0});if(n||!i||i.length===0){e.innerHTML='<div class="empty-state-box" style="grid-column: 1 / -1;"><p>No VIP tiers configured.</p></div>';return}m=i,e.innerHTML=i.map(t=>`
        <div class="tier-card" id="card-${t.level}">
          <!-- Top Bar -->
          <div class="tier-top-bar">
            <span class="tier-name">${_(t.name)}</span>
            <span class="tier-badge">TIER #${t.level}</span>
          </div>

          <!-- Body -->
          <div class="tier-body">
            <!-- Salary Box -->
            <div class="salary-box">
              <div>
                <span class="salary-label">DAILY SALARY</span>
                <div class="salary-val">${r(t.daily_salary)}</div>
              </div>
              <div style="text-align: right;">
                <span class="salary-label">MONTHLY SALARY</span>
                <div class="salary-val" style="color: var(--white);">${r(t.monthly_salary)}</div>
              </div>
            </div>

            <!-- Requirements Grid -->
            <div class="reqs-grid">
              <div>
                <span class="req-item-label">Downlines</span>
                <div class="req-item-val">${t.required_active_downlines} Active</div>
              </div>
              <div>
                <span class="req-item-label">Team Volume</span>
                <div class="req-item-val" style="color: var(--primary-green);">${r(t.required_team_deposits)}</div>
              </div>
              <div>
                <span class="req-item-label">Personal Dep</span>
                <div class="req-item-val">${r(t.required_personal_deposit)}</div>
              </div>
            </div>

            <!-- Edit Button -->
            <button class="btn-edit-tier" onclick="openEditModal(${t.level})">
              <span>✏️</span>
              <span>Edit Tier Settings</span>
            </button>
          </div>
        </div>
      `).join("")}window.openEditModal=function(a){const e=m.find(i=>i.level===a);e&&(document.getElementById("modalHeaderTitle").textContent=`Edit ${e.name}`,document.getElementById("editLevel").value=e.level,document.getElementById("editName").value=e.name,document.getElementById("editDaily").value=e.daily_salary,document.getElementById("editMonthly").value=e.monthly_salary,document.getElementById("editDownlines").value=e.required_active_downlines,document.getElementById("editTeam").value=e.required_team_deposits,document.getElementById("editPersonal").value=e.required_personal_deposit,document.getElementById("tierModal").classList.add("active"))};document.getElementById("closeModalBtn").addEventListener("click",()=>{document.getElementById("tierModal").classList.remove("active")});document.getElementById("editTierForm").addEventListener("submit",async a=>{a.preventDefault();const e=document.getElementById("saveTierBtn");e.disabled=!0,e.textContent="Saving Tier Configuration...";const i=Number(document.getElementById("editLevel").value),n=document.getElementById("editName").value.trim(),t=Number(document.getElementById("editDaily").value),u=Number(document.getElementById("editMonthly").value),v=Number(document.getElementById("editDownlines").value),y=Number(document.getElementById("editTeam").value),p=Number(document.getElementById("editPersonal").value);try{const{data:l,error:d}=await s.rpc("admin_update_referral_vip_tier",{p_admin_id:o.user.id,p_level:i,p_name:n,p_daily_salary:t,p_monthly_salary:u,p_required_downlines:v,p_required_team_deposits:y,p_required_personal_deposit:p});d||!(l!=null&&l.success)?alert("Failed to update tier: "+((l==null?void 0:l.error)||(d==null?void 0:d.message)||"Error")):(alert(`${n} updated successfully!`),document.getElementById("tierModal").classList.remove("active"),c())}catch(l){alert("Server communication error: "+l.message)}finally{e.disabled=!1,e.textContent="Save Tier Configuration"}});function _(a){return a?a.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]):""}c();
