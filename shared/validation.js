export function isValidAmount(val, min = 0.01, max = 100000000) {
  const num = Number(val);
  return !isNaN(num) && num >= min && num <= max && Number.isFinite(num);
}

export function isValidNigerianPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^((\+234)|0)[789][01]\d{8}$/.test(cleaned);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}
