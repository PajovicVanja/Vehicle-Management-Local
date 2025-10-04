// api/vehicle/malfunctions.js
const { db } = require('../_lib/firebaseAdmin');
const { verifyAuth } = require('../_lib/verifyAuth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    const snap = await db.collection('malfunctions').get();
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.status(200).json(list);
  } catch (e) {
    console.error('get malfunctions error:', e);
    res.status(500).json({ message: 'Error fetching malfunction data.', error: e.message });
  }
};
