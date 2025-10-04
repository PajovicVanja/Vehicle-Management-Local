// api/_lib/cors.jss
const ALLOW_ORIGINS = new Set([
  'https://company-vehicle-management.web.app',
  'https://company-vehicle-management.firebaseapp.com',
  'http://localhost:3000'
]);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOW_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // fallback (pick your primary prod origin)
    res.setHeader('Access-Control-Allow-Origin', 'https://company-vehicle-management.web.app');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function handlePreflight(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = { setCors, handlePreflight };
