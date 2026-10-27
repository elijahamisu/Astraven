import { requireAuth, signOutUser, supabase } from './supabase-client.js';

export const ADMIN_NAVIGATION_CONFIG = [
  {
    group: 'OVERVIEW',
    items: [
      { label: 'Overview', href: 'index.html' },
      { label: 'Reports', href: 'reports.html' },
      { label: 'Audit Logs', href: 'audit-logs.html' }
    ]
  },
  {
    group: 'USERS & WALLETS',
    items: [
      { label: 'Users', href: 'users.html' },
      { label: 'User Details', href: 'user-details.html' },
      { label: 'Transactions', href: 'transactions.html' },
      { label: 'Wallet Adjustments', href: 'wallet-adjustments.html' }
    ]
  },
  {
    group: 'FINANCIAL OPS',
    items: [
      { label: 'Deposits', href: 'deposits.html' },
      { label: 'Withdrawals', href: 'withdrawals.html' },
      { label: 'Withdrawal Proofs', href: 'withdrawal-proofs.html' }
    ]
  },
  {
    group: 'PRODUCTS & INVESTMENTS',
    items: [
      { label: 'Products', href: 'products.html' },
      { label: 'Create Product', href: 'product-create.html' },
      { label: 'Investments', href: 'investments.html' }
    ]
  },
  {
    group: 'REWARDS & REFERRALS',
    items: [
      { label: 'Referrals', href: 'referrals.html' },
      { label: 'Referral VIP', href: 'referral-vip.html' },
      { label: 'Lucky Wheel', href: 'lucky-wheel.html' },
      { label: 'Gift Codes', href: 'gift-codes.html' },
      { label: 'Gift Code History', href: 'gift-code-history.html' },
      { label: 'Leaderboard', href: 'leaderboard.html' }
    ]
  },
  {
    group: 'COMMUNICATIONS',
    items: [
      { label: 'Customer Service', href: 'customer-service.html' },
      { label: 'Blog Moderation', href: 'blog.html' },
      { label: 'Announcements', href: 'announcements.html' },
      { label: 'Notifications', href: 'notifications.html' }
    ]
  },
  {
    group: 'SYSTEM',
    items: [
      { label: 'Staff & Roles', href: 'staff.html' },
      { label: 'Website Settings', href: 'settings.html' }
    ]
  }
];

export async function initAdminNavigation() {
  const session = await requireAuth('../login.html');
  if (!session) return null;

  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();

  if (error || !userRole || !['admin', 'superadmin', 'support_agent'].includes(userRole.role)) {
    alert('Access Denied: You do not possess administrative permissions.');
    window.location.href = '../dashboard.html';
    return null;
  }

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  const sidebarHTML = `
    <div class="mobile-nav-bar">
      <button id="adminMenuOpen" class="mobile-menu-btn" aria-label="Open menu">☰</button>
      <a href="index.html" class="mobile-brand">✦ ASTRAVEN <small>ADMIN</small></a>
      <a href="../dashboard.html" class="mobile-bell" title="Return to client">🏠</a>
    </div>

    <div class="sidebar-backdrop" id="adminBackdrop"></div>

    <aside class="astra-sidebar" id="adminSidebar">
      <div class="sidebar-header">
        <a href="index.html" class="sidebar-brand">
          <span class="brand-crest">✦</span>
          <span class="brand-title">ASTRAVEN <small style="font-size:0.6em;color:var(--bright-gold);">ADMIN</small></span>
        </a>
      </div>

      <div class="user-badge-mini">
        <div class="user-avatar" style="background:#550000;border-color:var(--bright-gold);">A</div>
        <div class="user-info">
          <p class="user-name">${session.user.email}</p>
          <span class="vip-status-pill">${userRole.role.toUpperCase()}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${ADMIN_NAVIGATION_CONFIG.map(group => `
          <div class="nav-group">
            <h4 class="nav-group-title">${group.group}</h4>
            <ul class="nav-list">
              ${group.items.map(item => `
                <li class="nav-item">
                  <a href="${item.href}" class="nav-link ${currentFile === item.href ? 'active' : ''}">
                    <span>${item.label}</span>
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <a href="../dashboard.html" class="btn-emerald" style="width:100%;margin-bottom:8px;font-size:0.85rem;padding:8px;">User Dashboard</a>
        <button id="adminLogoutBtn" class="btn-logout" type="button">Sign Out</button>
      </div>
    </aside>
  `;

  const container = document.getElementById('adminNavigationContainer') || document.body;
  container.insertAdjacentHTML('afterbegin', sidebarHTML);

  const sidebar = document.getElementById('adminSidebar');
  const backdrop = document.getElementById('adminBackdrop');
  const menuBtn = document.getElementById('adminMenuOpen');

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
  sidebar?.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
    if (window.innerWidth <= 900) closeSidebar();
  }));

  document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => {
    await signOutUser();
  });

  return { session, role: userRole.role };
}
