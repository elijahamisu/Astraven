import"./mobile-cards-DX-1T3ZF.js";import{r as z,s as E,a as I}from"./supabase-client-BCUvSBAr.js";const t={overview:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>',deposits:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"/></svg>',withdrawals:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-4H8l4-4 4 4h-3v4z"/></svg>',users:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',settings:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',hamburger:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',logout:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>'},H=[{group:"EXECUTIVE OVERVIEW",items:[{label:"Overview",href:"/admin/index.html"},{label:"Reports & Analytics",href:"/admin/reports.html"},{label:"Audit Logs",href:"/admin/audit-logs.html"},{label:"Website Settings",href:"/admin/settings.html"}]},{group:"INVESTORS & CUSTODY",items:[{label:"User Directory",href:"/admin/users.html"},{label:"Transaction Ledger",href:"/admin/transactions.html"},{label:"Wallet Adjustments",href:"/admin/wallet-adjustments.html"},{label:"Deposits Review",href:"/admin/deposits.html"},{label:"Withdrawal Rails",href:"/admin/withdrawals.html"},{label:"Payment Gateway",href:"/admin/gateway.html"}]},{group:"PORTFOLIOS & PRODUCTS",items:[{label:"Product Catalog",href:"/admin/products.html"},{label:"Create Product",href:"/admin/product-create.html"},{label:"Active Investments",href:"/admin/investments.html"}]},{group:"AFFILIATES & REWARDS",items:[{label:"Referrals Network",href:"/admin/referrals.html"},{label:"Referral VIP Tiers",href:"/admin/referral-vip.html"},{label:"Lucky Wheel Config",href:"/admin/lucky-wheel.html"},{label:"Gift Vouchers",href:"/admin/gift-codes.html"},{label:"Gift Code History",href:"/admin/gift-code-history.html"},{label:"Leaderboard Audit",href:"/admin/leaderboard.html"}]},{group:"COMMUNICATIONS & SUPPORT",items:[{label:"Customer Helpdesk",href:"/admin/customer-service.html"},{label:"Blog Moderation",href:"/admin/blog.html"},{label:"Withdrawal Proofs",href:"/admin/withdrawal-proofs.html"},{label:"Announcements",href:"/admin/announcements.html"},{label:"Send Notifications",href:"/admin/notifications.html"}]},{group:"SECURITY & GOVERNANCE",items:[{label:"Staff Management",href:"/admin/staff.html"}]}];async function $(){var m;const n=await z("/admin/login.html");if(!n)return null;const{data:l,error:u}=await E.from("user_roles").select("role").eq("user_id",n.user.id).single();if(u||!l||!["admin","superadmin","support_agent"].includes(l.role))return alert("Access Denied: You do not possess administrative permissions."),window.location.replace("/dashboard.html"),null;const e=window.location.pathname.replace(/\/$/,""),b=`
    <div class="mobile-top-header">
      <div class="header-left">
        <button id="adminMenuOpen" class="header-hamburger-btn" aria-label="Toggle admin drawer">
          ${t.hamburger}
        </button>
        <a href="/admin/index.html" class="header-brand">
          <span style="color:var(--bright-gold);font-size:1.4rem;">✈</span>
          <span class="brand-wordmark">ASTRAVEN <small style="font-size:0.65rem;color:var(--bright-gold);">ADMIN</small></span>
        </a>
      </div>
      <div class="header-right">
        <a href="/dashboard.html" class="header-icon-btn" title="Return to Investor Dashboard">🏠</a>
      </div>
    </div>
  `,p='<div class="sidebar-backdrop" id="adminBackdrop"></div>',g=`
    <aside class="astra-sidebar" id="adminSidebar">
      <div class="sidebar-header">
        <a href="/admin/index.html" class="header-brand">
          <span style="color:var(--bright-gold);font-size:1.4rem;">✈</span>
          <span class="brand-wordmark">ASTRAVEN <small style="font-size:0.65rem;color:var(--bright-gold);">ADMIN</small></span>
        </a>
      </div>

      <div class="sidebar-avatar-panel">
        <div class="sidebar-avatar" style="background:#4A0000;border-color:var(--bright-gold);">A</div>
        <div class="sidebar-user-details">
          <p class="sidebar-user-name">${n.user.email}</p>
          <span class="sidebar-vip-badge">${l.role.toUpperCase()}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${H.map(s=>`
          <div class="nav-group">
            <h4 class="nav-group-title">${s.group}</h4>
            <ul class="nav-list">
              ${s.items.map(r=>{const v=r.href.replace(/\.html$/,""),M=e===v||e===r.href||e.endsWith(v);return`
                  <li>
                    <a href="${r.href}" class="nav-link ${M?"active":""}">
                      <span>${r.label}</span>
                    </a>
                  </li>
                `}).join("")}
            </ul>
          </div>
        `).join("")}
      </nav>

      <div class="sidebar-footer">
        <a href="/dashboard.html" class="btn-emerald" style="width:100%;margin-bottom:8px;padding:8px;font-size:0.82rem;text-align:center;text-decoration:none;">User Dashboard</a>
        <button id="adminLogoutBtn" class="btn-sidebar-logout" type="button">
          ${t.logout}
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  `,f=e==="/admin"||e.endsWith("/admin/index")||e.endsWith("/admin/index.html"),w=e.endsWith("deposits")||e.endsWith("deposits.html"),y=e.endsWith("withdrawals")||e.endsWith("withdrawals.html"),A=e.endsWith("users")||e.endsWith("users.html")||e.endsWith("user-details")||e.endsWith("user-details.html"),L=e.endsWith("settings")||e.endsWith("settings.html"),S=`
    <nav class="mobile-bottom-nav" aria-label="Admin mobile navigation">
      <a href="/admin/index.html" class="bottom-nav-item ${f?"active":""}">
        ${t.overview}
        <span>Overview</span>
      </a>
      <a href="/admin/deposits.html" class="bottom-nav-item ${w?"active":""}">
        ${t.deposits}
        <span>Deposits</span>
      </a>
      <a href="/admin/withdrawals.html" class="bottom-nav-item ${y?"active":""}">
        ${t.withdrawals}
        <span>Payouts</span>
      </a>
      <a href="/admin/users.html" class="bottom-nav-item ${A?"active":""}">
        ${t.users}
        <span>Users</span>
      </a>
      <a href="/admin/settings.html" class="bottom-nav-item ${L?"active":""}">
        ${t.settings}
        <span>Settings</span>
      </a>
    </nav>
  `,d=document.getElementById("adminNavigationContainer")||document.body,c=b+p+g+S;d.id==="adminNavigationContainer"?d.innerHTML=c:d.insertAdjacentHTML("afterbegin",c);const a=document.getElementById("adminSidebar"),i=document.getElementById("adminBackdrop"),o=document.getElementById("adminMenuOpen");function C(){a.classList.add("open"),i.classList.add("visible"),document.body.style.overflow="hidden"}function h(){a.classList.remove("open"),i.classList.remove("visible"),document.body.style.overflow=""}return o==null||o.addEventListener("click",C),i==null||i.addEventListener("click",h),a==null||a.querySelectorAll(".nav-link").forEach(s=>s.addEventListener("click",()=>{window.innerWidth<=900&&h()})),window.addEventListener("keydown",s=>{s.key==="Escape"&&(a!=null&&a.classList.contains("open"))&&h()}),(m=document.getElementById("adminLogoutBtn"))==null||m.addEventListener("click",async()=>{await I()}),{session:n,role:l.role}}export{$ as i};
