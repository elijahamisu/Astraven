import"./site-settings-CjsVQood.js";import"./mobile-cards-DX-1T3ZF.js";import{a as C,r as A,s as c}from"./supabase-client-DdZx35sm.js";const t={home:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',products:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-5.5 9h11zM12 22l5.5-9h-11z"/></svg>',invest:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>',wallet:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',profile:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',bell:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',menu:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',plane:'<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',logout:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>'},B=[{group:"MAIN",items:[{label:"Dashboard",href:"dashboard.html"},{label:"Notifications",href:"notifications.html"}]},{group:"PRODUCTS",items:[{label:"ASTRA-VIP",href:"vip.html"},{label:"SSVIP",href:"ssvip.html"},{label:"Limited Products",href:"limited-products.html"},{label:"My Investments",href:"my-investments.html"}]},{group:"WALLET",items:[{label:"My Wallet",href:"wallet.html"},{label:"Deposit",href:"deposit.html"},{label:"Deposit History",href:"deposit-history.html"},{label:"Withdraw",href:"withdraw.html"},{label:"Bind Bank Card",href:"bank-card.html"},{label:"Withdrawal History",href:"withdrawal-history.html"},{label:"Transactions",href:"transactions.html"}]},{group:"REWARDS & REFERRALS",items:[{label:"Referrals",href:"referrals.html"},{label:"Referral VIP",href:"referral-vip.html"},{label:"Lucky Wheel",href:"lucky-wheel.html"},{label:"Lucky Wheel History",href:"lucky-wheel-history.html"},{label:"Gift Code",href:"gift-code.html"},{label:"Leaderboard",href:"leaderboard.html"}]},{group:"COMMUNITY",items:[{label:"Blog",href:"blog.html"},{label:"Create Post",href:"create-post.html"},{label:"My Posts",href:"my-posts.html"},{label:"Announcements",href:"announcements.html"}]},{group:"SUPPORT",items:[{label:"Customer Service",href:"customer-service.html"},{label:"FAQ",href:"faq.html"}]},{group:"ACCOUNT",items:[{label:"Profile",href:"profile.html"},{label:"Settings",href:"settings.html"}]},{group:"LEGAL",items:[{label:"Terms",href:"terms.html"},{label:"Privacy Policy",href:"privacy.html"},{label:"Risk Disclosure",href:"risk-disclosure.html"}]}];async function V({requireSession:w=!0}={}){var p,b;let r=null;const n=window.location.pathname.split("/").pop()||"index.html",a=window.location.pathname.includes("/admin/")?"../":"./",y=`
    <header class="mobile-top-header">
      <div class="header-left">
        <button id="mobileMenuOpen" class="header-hamburger-btn" aria-label="Open sidebar menu">
          ${t.menu}
        </button>
        <a href="${a}dashboard.html" class="header-brand">
          <div class="brand-crest-icon">${t.plane}</div>
          <span class="brand-wordmark">ASTRAVEN</span>
        </a>
      </div>
      <div class="header-right">
        <a href="${a}notifications.html" class="header-icon-btn" aria-label="Notifications">
          ${t.bell}
          <span id="headerUnreadDot" class="badge-unread-dot" style="display:none;">0</span>
        </a>
        <a href="${a}profile.html" class="header-icon-btn" aria-label="Profile">
          ${t.profile}
        </a>
      </div>
    </header>
  `,L='<div class="sidebar-backdrop" id="sidebarBackdrop"></div>',$=`
    <aside class="astra-sidebar" id="astraSidebar" aria-label="Main navigation drawer">
      <div class="sidebar-header">
        <a href="${a}dashboard.html" class="header-brand">
          <div class="brand-crest-icon" style="width:28px;height:28px;">${t.plane}</div>
          <span class="brand-wordmark" style="font-size:1.35rem;">ASTRAVEN</span>
        </a>
      </div>

      <div class="sidebar-avatar-panel">
        <div class="sidebar-avatar" id="navAvatar">A</div>
        <div class="sidebar-user-details">
          <p class="sidebar-user-name" id="navUserName">Investor</p>
          <span class="sidebar-vip-badge" id="navVipLevel">✦ Standard VIP</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${B.map(e=>`
          <div class="nav-group">
            <h4 class="nav-group-title">${e.group}</h4>
            <ul class="nav-list">
              ${e.items.map(s=>{const i=n===s.href;return`
                  <li>
                    <a href="${a}${s.href}" class="nav-link ${i?"active":""}">
                      <span>${s.label}</span>
                    </a>
                  </li>
                `}).join("")}
            </ul>
          </div>
        `).join("")}
      </nav>

      <div class="sidebar-footer">
        <button id="logoutBtn" class="btn-sidebar-logout" type="button">
          ${t.logout}
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  `,M=`
    <nav class="mobile-bottom-nav" aria-label="Mobile bottom navigation">
      <a href="${a}dashboard.html" class="bottom-nav-item ${n==="dashboard.html"?"active":""}">
        ${t.home}
        <span>Home</span>
      </a>
      <a href="${a}vip.html" class="bottom-nav-item ${n==="vip.html"?"active":""}">
        ${t.products}
        <span>Products</span>
      </a>
      <a href="${a}my-investments.html" class="bottom-nav-item ${n==="my-investments.html"?"active":""}">
        ${t.invest}
        <span>Invest</span>
      </a>
      <a href="${a}wallet.html" class="bottom-nav-item ${n==="wallet.html"?"active":""}">
        ${t.wallet}
        <span>Wallet</span>
      </a>
      <a href="${a}profile.html" class="bottom-nav-item ${n==="profile.html"?"active":""}">
        ${t.profile}
        <span>Profile</span>
      </a>
    </nav>
  `,v=document.getElementById("navigationContainer"),m=y+L+$+M;v?v.innerHTML=m:document.body.insertAdjacentHTML("afterbegin",m);const l=document.getElementById("astraSidebar"),o=document.getElementById("sidebarBackdrop"),d=document.getElementById("mobileMenuOpen");function E(){l.classList.add("open"),o.classList.add("visible"),document.body.style.overflow="hidden"}function h(){l.classList.remove("open"),o.classList.remove("visible"),document.body.style.overflow=""}if(d==null||d.addEventListener("click",E),o==null||o.addEventListener("click",h),l==null||l.querySelectorAll(".nav-link").forEach(e=>{e.addEventListener("click",()=>{window.innerWidth<=900&&h()})}),window.addEventListener("keydown",e=>{e.key==="Escape"&&(l!=null&&l.classList.contains("open"))&&h()}),(p=document.getElementById("logoutBtn"))==null||p.addEventListener("click",async()=>{await C()}),!(w&&(r=await A(),!r))&&r&&c){const{data:e}=await c.from("profiles").select("full_name, username, astra_vip_level").eq("id",r.user.id).maybeSingle();if(e){const i=e.full_name||e.username||((b=r.user.email)==null?void 0:b.split("@")[0])||"Investor",f=document.getElementById("navUserName"),u=document.getElementById("navAvatar"),g=document.getElementById("navVipLevel");f&&(f.textContent=i),u&&(u.textContent=i.charAt(0).toUpperCase()),g&&(g.textContent=e.astra_vip_level>0?`✦ VIP ${e.astra_vip_level}`:"✦ Standard Member")}const{count:s}=await c.from("notifications").select("*",{count:"exact",head:!0}).eq("user_id",r.user.id).eq("is_read",!1);if(s&&s>0){const i=document.getElementById("headerUnreadDot");i&&(i.textContent=s>9?"9+":s,i.style.display="flex")}}}export{V as i};
