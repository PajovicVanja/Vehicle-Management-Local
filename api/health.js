// api/health.js
const { setCors, handlePreflight } = require('./_lib/cors');
module.exports = (req, res) => {
  if (handlePreflight(req, res)) return;
  setCors(req, res);
  res.status(200).json({ status: 'ok', message: 'API is running', timestamp: new Date().toISOString() });
};
