import { requireAuth, signOutUser, supabase } from './supabase-client.js';

export const ADMIN_NAVIGATION_CONFIG = [
  {
    group: 'EXECUTIVE OVERVIEW',
    items: [
      { label: 'Overview', href: 'index.html' },
      { label: 'Website Settings', href: 'settings.html' }
    ]
  },
  {
    group: 'FINANCIAL SETTLEMENTS',
    items: [
      { label: 'Deposits', href: 'deposits.html' },
      { label: 'Withdrawals', href: 'withdrawals.html' },
      { label: 'Wallet Adjustments', href: 'wallet-adjustments.html' }
    ]
  }
];

export async function initAdminNavigation() {
  const session = await requireAuth('../login.html');
  if (!session) return null;

  // Strict Server-Side Role Check
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
    <div class="mobile-top-header">
      <div class="header-left">
        <button id="adminMenuOpen" class="header-hamburger-btn" aria-label="Toggle admin drawer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
        <a href="index.html" class="header-brand">
          <span style="color:var(--bright-gold);font-size:1.4rem;">✈</span>
          <span class="brand-wordmark">ASTRAVEN <small style="font-size:0.65rem;color:var(--bright-gold);">ADMIN</small></span>
        </a>
      </div>
      <div class="header-right">
        <a href="../dashboard.html" class="header-icon-btn" title="Return to Investor Dashboard">🏠</a>
      </div>
    </div>

    <div class="sidebar-backdrop" id="adminBackdrop"></div>

    <aside class="astra-sidebar" id="adminSidebar">
      <div class="sidebar-header">
        <a href="index.html" class="header-brand">
          <span style="color:var(--bright-gold);font-size:1.4rem;">✈</span>
          <span class="brand-wordmark">ASTRAVEN <small style="font-size:0.65rem;color:var(--bright-gold);">ADMIN</small></span>
        </a>
      </div>

      <div class="sidebar-avatar-panel">
        <div class="sidebar-avatar" style="background:#4A0000;border-color:var(--bright-gold);">A</div>
        <div class="sidebar-user-details">
          <p class="sidebar-user-name">${session.user.email}</p>
          <span class="sidebar-vip-badge">${userRole.role.toUpperCase()}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${ADMIN_NAVIGATION_CONFIG.map(group => `
          <div class="nav-group">
            <h4 class="nav-group-title">${group.group}</h4>
            <ul class="nav-list">
              ${group.items.map(item => `
                <li>
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
        <a href="../dashboard.html" class="btn-emerald" style="width:100%;margin-bottom:8px;padding:8px;font-size:0.82rem;text-align:center;">User Dashboard</a>
        <button id="adminLogoutBtn" class="btn-sidebar-logout" type="button">Sign Out</button>
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
