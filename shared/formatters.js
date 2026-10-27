export function formatCurrency(amount, { includeSymbol = true, isKobo = false } = {}) {
  let numericVal = Number(amount);
  if (isNaN(numericVal)) return '₦0.00';
  if (isKobo) numericVal = numericVal / 100;
  
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericVal);

  return includeSymbol ? `₦${formatted}` : formatted;
}

export function formatDate(timestamp, { includeTime = true } = {}) {
  if (!timestamp) return '—';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '—';

  const dateStr = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  if (!includeTime) return dateStr;

  const timeStr = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `${dateStr}, ${timeStr}`;
}
