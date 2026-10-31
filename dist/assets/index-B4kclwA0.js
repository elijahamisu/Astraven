import{s}from"./supabase-client-BCUvSBAr.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";async function e(){if(!s)return;const{data:{session:t}}=await s.auth.getSession();t&&(document.getElementById("navAuthSlot").innerHTML=`
          <a href="dashboard.html" class="btn-gold" style="padding: 8px 18px; font-size: 0.85rem;">My Dashboard →</a>
        `,document.getElementById("heroCtaSlot").innerHTML=`
          <a href="dashboard.html" class="btn-gold" style="padding: 14px 32px; font-size: 1.05rem;">Access Investor Dashboard →</a>
        `)}e();
