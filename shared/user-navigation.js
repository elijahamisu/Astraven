import { requireAuth, signOutUser, supabase } from './supabase-client.js';

export const USER_NAVIGATION_CONFIG = [
  {
    group: 'MAIN',
    items: [
      { label: 'Dashboard', href: 'dashboard.html', icon: 'fa-gauge' }
    ]
  },
  {
    group: 'PRODUCTS',
    items: [
      { label: 'ASTRA-VIP', href: 'vip.html', icon: 'fa-crown' },
      { label: 'SSVIP', href: 'ssvip.html', icon: 'fa-gem' },
      { label: 'Limited Products', href: 'limited-products.html', icon: 'fa-fire' },
      { label: 'My Investments', href: 'my-investments.html', icon: 'fa-chart-pie' }
    ]
  },
  {
    group: 'WALLET',
    items: [
      { label: 'My Wallet', href: 'wallet.html', icon: 'fa-wallet' },
      { label: 'Deposit', href: 'deposit.html', icon: 'fa-money-bill-transfer' },
      { label: 'Deposit History', href: 'deposit-history.html', icon: 'fa-list-check' },
      { label: 'Withdraw', href: 'withdraw.html', icon: 'fa-arrow-up-from-bracket' },
      { label: 'Withdrawal History', href: 'withdrawal-history.html', icon: 'fa-clock-rotate-left' },
      { label: 'Transactions', href: 'transactions.html', icon: 'fa-receipt' }
    ]
  },
  {
    group: 'REWARDS & REFERRALS',
    items: [
      { label: 'Referrals', href: 'referrals.html', icon: 'fa-users' },
      { label: 'Referral VIP', href: 'referral-vip.html', icon: 'fa-medal' },
      { label: 'Lucky Wheel', href: 'lucky-wheel.html', icon: 'fa-dharmachakra' },
      { label: 'Lucky Wheel History', href: 'lucky-wheel-history.html', icon: 'fa-timeline' },
      { label: 'Gift Code', href: 'gift-code.html', icon: 'fa-gift' },
      { label: 'Leaderboard', href: 'leaderboard.html', icon: 'fa-trophy' }
    ]
  },
  {
    group: 'COMMUNITY',
    items: [
      { label: 'Blog', href: 'blog.html', icon: 'fa-newspaper' },
      { label: 'Create Post', href: 'create-post.html', icon: 'fa-pen-to-square' },
      { label: 'My Posts', href: 'my-posts.html', icon: 'fa-folder-open' },
      { label: 'Announcements', href: 'announcements.html', icon: 'fa-bullhorn' }
    ]
  },
  {
    group: 'SUPPORT',
    items: [
      { label: 'Customer Service', href: 'customer-service.html', icon: 'fa-headset' },
      { label: 'FAQ', href: 'faq.html', icon: 'fa-circle-question' }
    ]
  },
  {
    group: 'ACCOUNT',
    items: [
      { label: 'Profile', href: 'profile.html', icon: 'fa-user' },
      { label: 'Settings', href: 'settings.html', icon: 'fa-sliders' },
      { label: 'Notifications', href: 'notifications.html', icon: 'fa-bell' }
    ]
  },
  {
    group: 'LEGAL',
    items: [
      { label: 'Terms', href: 'terms.html', icon: 'fa-file-contract' },
      { label: 'Privacy Policy', href: 'privacy.html', icon: 'fa-shield-halved' },
      { label: 'Risk Disclosure', href: 'risk-disclosure.html', icon: 'fa-triangle-exclamation' }
    ]
  }
];

export async function initUserNavigation({ requireSession = true } = {}) {
  let session = null;
  if (requireSession) {
    session = await requireAuth();
    if (!session) return;
  }

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const isNested = window.location.pathname.includes('/admin/');
  const rootPrefix = isNested ? '../' : './';

  // Inject navigation DOM
  const sidebarHTML = `
    <aside class="astra-sidebar" id="astraSidebar">
      <div class="sidebar-header">
        <a href="${rootPrefix}dashboard.html" class="sidebar-brand">
          <span class="brand-crest">✦</span>
          <span class="brand-title">ASTRAVEN</span>
        </a>
      </div>
      <div class="user-badge-mini" id="navUserBadge">
        <div class="user-avatar" id="navAvatar">U</div>
        <div class="user-info">
          <p class="user-name" id="navUserName">Loading...</p>
          <span class="vip-status-pill" id="navVipLevel">Standard</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${USER_NAVIGATION_CONFIG.map(group => `
          <div class="nav-group">
            <h4 class="nav-group-title">${group.group}</h4>
            <ul class="nav-list">
              ${group.items.map(item => {
                const isActive = currentPath === item.href;
                return `
                  <li class="nav-item">
                    <a href="${rootPrefix}${item.href}" class="nav-link ${isActive ? 'active' : ''}">
                      <span class="link-label">${item.label}</span>
                    </a>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <button id="logoutBtn" class="btn-logout" type="button">
          Sign Out
        </button>
      </div>
    </aside>

    <div class="mobile-nav-bar">
      <button id="mobileMenuOpen" class="mobile-menu-btn" aria-label="Open menu">☰</button>
      <a href="${rootPrefix}dashboard.html" class="mobile-brand">ASTRAVEN</a>
      <a href="${rootPrefix}notifications.html" class="mobile-bell" aria-label="Notifications">🔔</a>
    </div>

    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
  `;

  const navContainer = document.getElementById('navigationContainer');
  if (navContainer) {
    navContainer.innerHTML = sidebarHTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
  }

  // Sidebar toggle interactions
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
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
  });

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await signOutUser();
  });

  // Populate user data if authenticated
  if (session && supabase) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username, astra_vip_level')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      const displayName = profile.full_name || profile.username || session.user.email.split('@')[0];
      const nameEl = document.getElementById('navUserName');
      const avatarEl = document.getElementById('navAvatar');
      const vipEl = document.getElementById('navVipLevel');
      if (nameEl) nameEl.textContent = displayName;
      if (avatarEl) avatarEl.textContent = displayName.charAt(0).toUpperCase();
      if (vipEl) vipEl.textContent = profile.astra_vip_level ? `VIP ${profile.astra_vip_level}` : 'Standard';
    }
  }
}
