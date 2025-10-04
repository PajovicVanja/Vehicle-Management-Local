// api/_lib/cors.js
const STATIC_ALLOW = new Set([
  'https://company-vehicle-management.web.app',
  'https://company-vehicle-management.firebaseapp.com',
  'http://localhost:3000',
  // add your stable Vercel domain(s):
  'https://vehicle-management-frontend-alpha.vercel.app'
]);

function isAllowed(origin) {
  if (!origin) return false;
  if (STATIC_ALLOW.has(origin)) return true;

  // allow your Vercel/Firebase preview hosts too
  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith('.vercel.app')) return true;
    if (hostname.endsWith('.web.app')) return true;
    if (hostname.endsWith('.firebaseapp.com')) return true;
  } catch (_) {}
  return false;
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (isAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // since you use Bearer tokens (no cookies), "*" is fine
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    setCors(req, res);
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = { setCors, handlePreflight };
