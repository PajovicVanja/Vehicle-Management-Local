// api/reservation/reservation.js
const { db } = require('../_lib/firebaseAdmin');
const { verifyAuth } = require('../_lib/verifyAuth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    const snap = await db.collection('reservation').get();
    const list = snap.docs.map(d => d.data());
    res.status(200).json(list);
  } catch (e) {
    console.error('get reservations error:', e);
    res.status(500).json({ message: 'Error fetching reservations', error: e.message });
  }
};
