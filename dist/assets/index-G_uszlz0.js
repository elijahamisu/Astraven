import{s}from"./supabase-client-DdZx35sm.js";async function t(){if(!s)return;const{data:{session:e}}=await s.auth.getSession();e&&(document.getElementById("navAuthSlot").innerHTML=`
          <a href="dashboard.html" class="btn-gold" style="padding: 8px 18px; font-size: 0.85rem;">My Dashboard →</a>
        `,document.getElementById("heroCtaSlot").innerHTML=`
          <a href="dashboard.html" class="btn-gold" style="padding: 14px 32px; font-size: 1.05rem;">Access Investor Dashboard →</a>
        `)}t();
