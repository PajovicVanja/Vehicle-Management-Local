// api/_lib/cors.js
const ALLOW_ORIGIN = 'https://company-vehicle-management.web.app'; // your Firebase Hosting origin

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.setHeader('Vary', 'Origin'); // good practice for caches
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // no cookies used, so no credentials needed
}

function handlePreflight(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = { setCors, handlePreflight };
