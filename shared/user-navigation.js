import { requireAuth, signOutUser, supabase } from './supabase-client.js';

export const USER_NAVIGATION_CONFIG = [
  {
    group: 'MAIN',
    items: [
      { label: 'Dashboard', href: 'dashboard.html' }
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
      { label: 'Settings', href: 'settings.html' },
      { label: 'Notifications', href: 'notifications.html' }
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

  const sidebarHTML = `
    <div class="mobile-nav-bar">
      <button id="mobileMenuOpen" class="mobile-menu-btn" aria-label="Open menu">☰</button>
      <a href="${rootPrefix}dashboard.html" class="mobile-brand">✦ ASTRAVEN</a>
      <a href="${rootPrefix}notifications.html" class="mobile-bell" aria-label="Notifications">🔔</a>
    </div>

    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>

    <aside class="astra-sidebar" id="astraSidebar" aria-label="Navigation drawer">
      <div class="sidebar-header">
        <a href="${rootPrefix}dashboard.html" class="sidebar-brand">
          <span class="brand-crest">✦</span>
          <span class="brand-title">ASTRAVEN</span>
        </a>
      </div>

      <div class="user-badge-mini">
        <div class="user-avatar" id="navAvatar">U</div>
        <div class="user-info">
          <p class="user-name" id="navUserName">Investor</p>
          <span class="vip-status-pill" id="navVipLevel">Standard</span>
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
                  <li class="nav-item">
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
        <button id="logoutBtn" class="btn-logout" type="button">Sign Out</button>
      </div>
    </aside>
  `;

  const container = document.getElementById('navigationContainer');
  if (container) {
    container.innerHTML = sidebarHTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
  }

  // Interactive controls
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

  // Close drawer if user clicks a link
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

  // Fetch authenticated user profile for avatar/name
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
      if (vipEl) vipEl.textContent = profile.astra_vip_level > 0 ? `VIP ${profile.astra_vip_level}` : 'Standard';
    }
  }
}
