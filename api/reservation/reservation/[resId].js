// api/reservation/reservation/[resId].js
const { db } = require('../../_lib/firebaseAdmin');
const { verifyAuth } = require('../../_lib/verifyAuth');

module.exports = async (req, res) => {
  const { resId } = req.query;
  const method = req.method;

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    if (method === 'GET') {
      const ref = db.collection('reservation').doc(resId);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ message: 'Reservation not found' });
      return res.status(200).json({ id: doc.id, ...doc.data() });
    }

    if (method === 'DELETE') {
      const snap = await db.collection('reservation').where('reservationId', '==', resId).get();
      if (snap.empty) return res.status(404).json({ message: 'No reservation found with the specified ID' });
      const batch = db.batch();
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      return res.status(200).json({ message: `Reservation with id '${resId}' successfully deleted` });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (e) {
    console.error('reservation [id] error:', e);
    res.status(500).json({ message: 'Error handling reservation', error: e.message });
  }
};
