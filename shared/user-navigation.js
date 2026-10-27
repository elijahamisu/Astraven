import { requireAuth, signOutUser, supabase } from './supabase-client.js';

// SVG Icon Helpers
const ICONS = {
  home: `<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  products: `<svg viewBox="0 0 24 24"><path d="M12 2l-5.5 9h11zM12 22l5.5-9h-11z"/></svg>`,
  invest: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>`,
  wallet: `<svg viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
  profile: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  bell: `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`,
  menu: `<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>`,
  plane: `<svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`
};

export const USER_NAVIGATION_CONFIG = [
  {
    group: 'MAIN',
    items: [
      { label: 'Dashboard', href: 'dashboard.html' },
      { label: 'Notifications', href: 'notifications.html' }
    ]
  },
  {
    group: 'PRODUCTS',
    items: [
      { label: 'ASTRA-VIP', href: 'vip.html' },
      { label: 'SSVIP', href: 'ssvip.html' },
      { label: 'Limited Products', href: 'limited-products.html' },
      { label: 'My Investments', href: 'my-investments.html' }
    ]
  },
  {
    group: 'WALLET',
    items: [
      { label: 'My Wallet', href: 'wallet.html' },
      { label: 'Deposit', href: 'deposit.html' },
      { label: 'Deposit History', href: 'deposit-history.html' },
      { label: 'Withdraw', href: 'withdraw.html' },
      { label: 'Withdrawal History', href: 'withdrawal-history.html' },
      { label: 'Transactions', href: 'transactions.html' }
    ]
  },
  {
    group: 'REWARDS & REFERRALS',
    items: [
      { label: 'Referrals', href: 'referrals.html' },
      { label: 'Referral VIP', href: 'referral-vip.html' },
      { label: 'Lucky Wheel', href: 'lucky-wheel.html' },
      { label: 'Lucky Wheel History', href: 'lucky-wheel-history.html' },
      { label: 'Gift Code', href: 'gift-code.html' },
      { label: 'Leaderboard', href: 'leaderboard.html' }
    ]
  },
  {
    group: 'COMMUNITY',
    items: [
      { label: 'Blog', href: 'blog.html' },
      { label: 'Create Post', href: 'create-post.html' },
      { label: 'My Posts', href: 'my-posts.html' },
      { label: 'Announcements', href: 'announcements.html' }
    ]
  },
  {
    group: 'SUPPORT',
    items: [
      { label: 'Customer Service', href: 'customer-service.html' },
      { label: 'FAQ', href: 'faq.html' }
    ]
  },
  {
    group: 'ACCOUNT',
    items: [
      { label: 'Profile', href: 'profile.html' },
      { label: 'Settings', href: 'settings.html' }
    ]
  },
  {
    group: 'LEGAL',
    items: [
      { label: 'Terms', href: 'terms.html' },
      { label: 'Privacy Policy', href: 'privacy.html' },
      { label: 'Risk Disclosure', href: 'risk-disclosure.html' }
    ]
  }
];

export async function initUserNavigation({ requireSession = true } = {}) {
  let session = null;
  if (requireSession) {
    session = await requireAuth();
    if (!session) return;
  }

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const isNested = window.location.pathname.includes('/admin/');
  const rootPrefix = isNested ? '../' : './';

  // 1. Mobile Top Header
  const mobileHeaderHTML = `
    <header class="mobile-top-header">
      <div class="header-left">
        <button id="mobileMenuOpen" class="header-hamburger-btn" aria-label="Toggle navigation">
          ${ICONS.menu}
        </button>
        <a href="${rootPrefix}dashboard.html" class="header-brand">
          <div class="brand-crest-icon">${ICONS.plane}</div>
          <span class="brand-wordmark">ASTRAVEN</span>
        </a>
      </div>
      <div class="header-right">
        <a href="${rootPrefix}notifications.html" class="header-icon-btn" aria-label="Notifications">
          ${ICONS.bell}
          <span id="headerUnreadDot" class="badge-unread-dot" style="display:none;">0</span>
        </a>
        <a href="${rootPrefix}profile.html" class="header-icon-btn" aria-label="Profile">
          ${ICONS.profile}
        </a>
      </div>
    </header>
  `;

  // 2. Translucent Backdrop
  const backdropHTML = `<div class="sidebar-backdrop" id="sidebarBackdrop"></div>`;

  // 3. Complete Desktop/Mobile Sidebar
  const sidebarHTML = `
    <aside class="astra-sidebar" id="astraSidebar" aria-label="Main navigation drawer">
      <div class="sidebar-header">
        <a href="${rootPrefix}dashboard.html" class="header-brand">
          <div class="brand-crest-icon" style="width:28px;height:28px;">${ICONS.plane}</div>
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
        ${USER_NAVIGATION_CONFIG.map(group => `
          <div class="nav-group">
            <h4 class="nav-group-title">${group.group}</h4>
            <ul class="nav-list">
              ${group.items.map(item => {
                const isActive = currentFile === item.href;
                return `
                  <li>
                    <a href="${rootPrefix}${item.href}" class="nav-link ${isActive ? 'active' : ''}">
                      <span>${item.label}</span>
                    </a>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <button id="logoutBtn" class="btn-sidebar-logout" type="button">
          ${ICONS.logout}
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  `;

  // 4. Five-Button Bottom Navigation (Mandatory on mobile)
  const bottomNavHTML = `
    <nav class="mobile-bottom-nav" aria-label="Mobile bottom navigation">
      <a href="${rootPrefix}dashboard.html" class="bottom-nav-item ${currentFile === 'dashboard.html' ? 'active' : ''}">
        ${ICONS.home}
        <span>Home</span>
      </a>
      <a href="${rootPrefix}vip.html" class="bottom-nav-item ${currentFile === 'vip.html' ? 'active' : ''}">
        ${ICONS.products}
        <span>Products</span>
      </a>
      <a href="${rootPrefix}my-investments.html" class="bottom-nav-item ${currentFile === 'my-investments.html' ? 'active' : ''}">
        ${ICONS.invest}
        <span>Invest</span>
      </a>
      <a href="${rootPrefix}wallet.html" class="bottom-nav-item ${currentFile === 'wallet.html' ? 'active' : ''}">
        ${ICONS.wallet}
        <span>Wallet</span>
      </a>
      <a href="${rootPrefix}profile.html" class="bottom-nav-item ${currentFile === 'profile.html' ? 'active' : ''}">
        ${ICONS.profile}
        <span>Profile</span>
      </a>
    </nav>
  `;

  const container = document.getElementById('navigationContainer');
  const fullMarkup = mobileHeaderHTML + backdropHTML + sidebarHTML + bottomNavHTML;

  if (container) {
    container.innerHTML = fullMarkup;
  } else {
    document.body.insertAdjacentHTML('afterbegin', fullMarkup);
  }

  // Interactive drawer logic
  const sidebar = document.getElementById('astraSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const menuBtn = document.getElementById('mobileMenuOpen');

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  menuBtn?.addEventListener('click', openSidebar);
  backdrop?.addEventListener('click', closeSidebar);

  sidebar?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeSidebar();
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar?.classList.contains('open')) {
      closeSidebar();
    }
  });

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await signOutUser();
  });

  // Hydrate user profile info & notification counter
  if (session && supabase) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username, astra_vip_level')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile) {
      const displayName = profile.full_name || profile.username || session.user.email?.split('@')[0] || 'Investor';
      const nameEl = document.getElementById('navUserName');
      const avatarEl = document.getElementById('navAvatar');
      const vipEl = document.getElementById('navVipLevel');
      if (nameEl) nameEl.textContent = displayName;
      if (avatarEl) avatarEl.textContent = displayName.charAt(0).toUpperCase();
      if (vipEl) vipEl.textContent = profile.astra_vip_level > 0 ? `✦ VIP ${profile.astra_vip_level}` : '✦ Standard Member';
    }

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    if (count && count > 0) {
      const dot = document.getElementById('headerUnreadDot');
      if (dot) {
        dot.textContent = count > 9 ? '9+' : count;
        dot.style.display = 'flex';
      }
    }
  }
}
