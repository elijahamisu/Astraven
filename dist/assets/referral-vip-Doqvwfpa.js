import{s as o,r as u}from"./supabase-client-DdZx35sm.js";import{i as g}from"./user-navigation-mqSLN6Ik.js";import{a as r}from"./formatters-kkpPVsns.js";import"./site-settings-CjsVQood.js";import"./mobile-cards-DX-1T3ZF.js";let l=null;async function w(){await g({requireSession:!0});const a=await u();if(!a)return;l=a.user.id;const{data:i}=await o.from("referral_vip_levels").select("*").order("level",{ascending:!0}),{data:e}=await o.rpc("get_user_referral_vip_status",{p_user_id:l}),s=document.getElementById("vipLevelsContainer");if(!i||i.length===0){s.innerHTML='<p style="text-align: center; color: var(--secondary-text);">No Referral VIP tiers configured.</p>';return}const d=(e==null?void 0:e.active_downlines)||0,c=Number((e==null?void 0:e.team_deposits)||0),p=Number((e==null?void 0:e.personal_deposits)||0),m=(e==null?void 0:e.unlocked_level)||0;s.innerHTML=i.map(t=>{const n=m>=t.level,v=Math.min(100,Math.round(d/t.required_active_downlines*100)),f=Math.min(100,Math.round(c/t.required_team_deposits*100)),y=Math.min(100,Math.round(p/t.required_personal_deposit*100));return`
          <div class="vip-card ${n?"unlocked":""}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h2 style="font-size: 1.3rem; color: var(--deep-forest); font-family: var(--font-heading);">${t.name}</h2>
              <span class="badge-status ${n?"badge-completed":"badge-pending"}">
                ${n?"Unlocked & Active":"Locked"}
              </span>
            </div>

            <div class="salary-box">
              <div>
                <span style="font-size: 0.72rem; color: var(--soft-gold); text-transform: uppercase;">DAILY SALARY</span>
                <div style="font-size: 1.25rem; font-family: var(--font-heading); font-weight: 700; color: var(--bright-gold);">${r(t.daily_salary)}</div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.72rem; color: var(--soft-gold); text-transform: uppercase;">MONTHLY SALARY</span>
                <div style="font-size: 1.25rem; font-family: var(--font-heading); font-weight: 700; color: var(--white);">${r(t.monthly_salary)}</div>
              </div>
            </div>

            <!-- Progress 1: Active Downlines -->
            <div style="font-size: 0.8rem; color: var(--secondary-text); display: flex; justify-content: space-between;">
              <span>Active Downlines</span>
              <strong>${d} / ${t.required_active_downlines}</strong>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width: ${v}%;"></div>
            </div>

            <!-- Progress 2: Team Deposits -->
            <div style="font-size: 0.8rem; color: var(--secondary-text); display: flex; justify-content: space-between;">
              <span>Qualifying Team Deposits</span>
              <strong>${r(c)} / ${r(t.required_team_deposits)}</strong>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width: ${f}%;"></div>
            </div>

            <!-- Progress 3: Personal Deposit -->
            <div style="font-size: 0.8rem; color: var(--secondary-text); display: flex; justify-content: space-between;">
              <span>Personal Deposit</span>
              <strong>${r(p)} / ${r(t.required_personal_deposit)}</strong>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width: ${y}%;"></div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 14px;">
              ${n?`
                <button class="btn-gold" style="flex: 1; padding: 10px;" onclick="claimReward(${t.level}, 'daily')">Claim Daily (${r(t.daily_salary)})</button>
                <button class="btn-emerald" style="flex: 1; padding: 10px;" onclick="claimReward(${t.level}, 'monthly')">Claim Monthly</button>
              `:`
                <button class="btn-emerald" disabled style="width: 100%; opacity: 0.6; cursor: not-allowed; padding: 10px;">Requirements Incomplete</button>
              `}
            </div>
          </div>
        `}).join("")}window.claimReward=async function(a,i){const{data:e,error:s}=await o.rpc("claim_referral_vip_reward",{p_user_id:l,p_level:a,p_reward_type:i});s||!e.success?alert((e==null?void 0:e.error)||(s==null?void 0:s.message)||"Claim failed"):(alert(`Success! ₦${e.amount} credited to your available balance.`),window.location.reload())};w();
