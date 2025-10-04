// api/reservation/[...path].js
const { db } = require('../_lib/firebaseAdmin');
const { verifyAuth } = require('../_lib/verifyAuth');
const { setCors, handlePreflight } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return; // OPTIONS
  setCors(req, res);
const seg = req.query.path;
const parts = Array.isArray(seg)
  ? seg
  : seg
    ? String(seg).split('/').filter(Boolean)
    : (req.url.split('?')[0].replace(/^\/api\/reservation\/?/, '').split('/').filter(Boolean));


  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    // GET /api/reservation/reservation
    if (parts.length === 1 && parts[0] === 'reservation' && req.method === 'GET') {
      const snap = await db.collection('reservation').get();
      const list = snap.docs.map(d => d.data());
      return res.status(200).json(list);
    }

    // GET or DELETE /api/reservation/reservation/:resId
    if (parts.length === 2 && parts[0] === 'reservation') {
      const resId = parts[1];

      if (req.method === 'GET') {
        const ref = db.collection('reservation').doc(resId);
        const doc = await ref.get();
        if (!doc.exists) return res.status(404).json({ message: 'Reservation not found' });
        return res.status(200).json({ id: doc.id, ...doc.data() });
      }

      if (req.method === 'DELETE') {
        const snap = await db.collection('reservation').where('reservationId', '==', resId).get();
        if (snap.empty) return res.status(404).json({ message: 'No reservation found with the specified ID' });
        const batch = db.batch();
        snap.forEach(d => batch.delete(d.ref));
        await batch.commit();
        return res.status(200).json({ message: `Reservation with id '${resId}' successfully deleted` });
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    return res.status(404).json({ message: 'Not found' });
  } catch (e) {
    console.error('reservation catch-all error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
};
