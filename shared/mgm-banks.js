// MGM Pay Nigeria payout bank codes (send as payee.bank_code). Source: MGM Pay Naira Integration Guide, Oct 2026.
export const MGM_BANKS = [
  { name: 'Access Bank', code: '20013' },
  { name: 'ASO Savings and Loans', code: '20012' },
  { name: 'Ecobank Nigeria', code: '20026' },
  { name: 'Fidelity Bank', code: '20036' },
  { name: 'First Bank of Nigeria', code: '20039' },
  { name: 'First City Monument Bank (FCMB)', code: '20040' },
  { name: 'Globus Bank', code: '20043' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '20045' },
  { name: 'Heritage Bank', code: '20047' },
  { name: 'Jaiz Bank', code: '20051' },
  { name: 'Keystone Bank', code: '20053' },
  { name: 'Kuda Bank', code: '20055' },
  { name: 'Moniepoint Microfinance Bank', code: '20087' },
  { name: 'One Finance', code: '20063' },
  { name: 'Opay', code: '20009' },
  { name: 'PalmPay', code: '20065' },
  { name: 'Parkway-ReadyCash', code: '20066' },
  { name: 'Polaris Bank', code: '20068' },
  { name: 'Providus Bank', code: '20069' },
  { name: 'Stanbic IBTC Bank', code: '20073' },
  { name: 'Standard Chartered Bank', code: '20074' },
  { name: 'Sterling Bank', code: '20075' },
  { name: 'TAJ Bank', code: '20076' },
  { name: 'Titan Bank', code: '20079' },
  { name: 'Union Bank of Nigeria', code: '20080' },
  { name: 'United Bank For Africa (UBA)', code: '20081' },
  { name: 'Unity Bank', code: '20082' },
  { name: 'VFD Microfinance Bank', code: '20083' },
  { name: 'Zenith Bank', code: '20086' }
];

// Map an older stored bank (e.g. from the previous gateway) to an MGM code by code or name.
export function resolveMgmBank(code, name) {
  const byCode = MGM_BANKS.find(b => b.code === String(code || ''));
  if (byCode) return byCode;
  const norm = (s) => String(s || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/\b(bank|plc|limited|ltd|nigeria|of|microfinance|mfb)\b/g, '').replace(/[^a-z0-9]/g, '');
  const n = norm(name);
  if (!n) return null;
  return MGM_BANKS.find(b => norm(b.name) === n) || MGM_BANKS.find(b => norm(b.name).includes(n) || n.includes(norm(b.name))) || null;
}
