// Turns every data table into stacked cards on phones.
// Each <td> gets a data-label copied from its column header, so the CSS in
// theme.css (max-width: 768px) can show "Label: value" rows inside a card.
// Works for tables rendered later via innerHTML (MutationObserver).

function labelTable(table) {
  if (table.dataset.noCards !== undefined) return;
  const headers = Array.from(table.querySelectorAll('thead th, thead td'))
    .map((th) => th.textContent.replace(/\s+/g, ' ').trim());
  if (!headers.length) {
    const firstRow = table.querySelector('tr');
    if (firstRow && firstRow.querySelector('th')) {
      firstRow.querySelectorAll('th').forEach((th) => headers.push(th.textContent.replace(/\s+/g, ' ').trim()));
      firstRow.classList.add('mc-header-row');
    }
  }
  if (!headers.length) return;
  table.classList.add('mc-table');

  table.querySelectorAll('tbody tr, tr').forEach((tr) => {
    if (tr.parentElement && tr.parentElement.tagName === 'THEAD') return;
    if (tr.classList.contains('mc-header-row')) return;
    let col = 0;
    Array.from(tr.children).forEach((cell) => {
      const span = Number(cell.getAttribute('colspan') || 1);
      if (span > 1 || tr.children.length === 1) {
        cell.classList.add('mc-full');
      } else if (!cell.hasAttribute('data-label')) {
        cell.setAttribute('data-label', headers[col] || '');
      }
      col += span;
    });
  });
}

function labelAll(root = document) {
  root.querySelectorAll('table').forEach(labelTable);
}

let scheduled = false;
function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; labelAll(); });
}

if (typeof window !== 'undefined' && !window.__mobileCardsInit) {
  window.__mobileCardsInit = true;
  const start = () => {
    labelAll();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}
