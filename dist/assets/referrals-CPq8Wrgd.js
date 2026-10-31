import{r as p,s as n}from"./supabase-client-BCUvSBAr.js";import{i as g}from"./user-navigation-FagTkAhj.js";import{f as y}from"./usernames-CpnWIWI3.js";import{a as l,f as _}from"./formatters-kkpPVsns.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";import"./site-settings-CsXfhtzc.js";import"./mobile-cards-DX-1T3ZF.js";async function h(){await g({requireSession:!0});const i=await p();if(!i)return;const a=i.user.id,{data:r}=await n.from("profiles").select("referral_code").eq("id",a).single();if(r&&r.referral_code){document.getElementById("refCodeInput").value=r.referral_code;const e=`${window.location.origin}/register.html?ref=${r.referral_code}`;document.getElementById("refLinkInput").value=e,document.getElementById("copyCodeBtn").addEventListener("click",()=>{navigator.clipboard.writeText(r.referral_code),alert("Referral code copied!")}),document.getElementById("copyLinkBtn").addEventListener("click",()=>{navigator.clipboard.writeText(e),alert("Referral link copied!")}),document.getElementById("shareLinkBtn").addEventListener("click",async()=>{navigator.share?await navigator.share({title:"ASTRAVEN Aviation Wealth",text:"Join my investment flight syndicate on ASTRAVEN.",url:e}):(navigator.clipboard.writeText(e),alert("Referral link copied to clipboard!"))})}const{data:c}=await n.from("referral_commissions").select("commission_amount").eq("referrer_id",a),m=(c||[]).reduce((e,d)=>e+Number(d.commission_amount),0);document.getElementById("statTotalComm").textContent=l(m);const{data:t}=await n.from("referrals").select("referred_id, created_at").eq("referrer_id",a).order("created_at",{ascending:!1}),f=t?t.length:0;document.getElementById("statTotalRef").textContent=f;const{data:o}=await n.rpc("get_user_referral_vip_status",{p_user_id:a});o&&(document.getElementById("statActiveRef").textContent=o.active_downlines||0,document.getElementById("statTeamDep").textContent=l(o.team_deposits||0));const s=document.getElementById("teamContainer");if(!t||t.length===0){s.innerHTML='<p style="text-align: center; color: var(--secondary-text); padding: 30px;">You have no registered downlines yet. Share your referral link to begin earning.</p>';return}const u=await y(t.map(e=>e.referred_id));s.innerHTML=`
        <table class="tx-table">
          <thead>
            <tr><th>Member</th><th>Joined</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${t.map(e=>`
                <tr>
                  <td style="font-weight: 600;">@${u.get(e.referred_id)||"Investor_"+e.referred_id.substring(0,6)}</td>
                  <td style="color: var(--secondary-text); font-size: 0.8rem;">${_(e.created_at,{includeTime:!1})}</td>
                  <td><span class="badge-status badge-completed">Verified</span></td>
                </tr>
              `).join("")}
          </tbody>
        </table>
      `}h();
