// server/routes/reservation.js
const express = require('express');
const { db } = require('../lib/firebaseAdmin');
const { requireAuth } = require('../lib/verifyAuth');

const router = express.Router();

// All routes here require auth
router.use(requireAuth);

// GET /api/reservation/reservation
router.get('/reservation', async (_req, res) => {
  try {
    const snap = await db.collection('reservation').get();
    const list = snap.docs.map(d => d.data());
    res.status(200).json(list);
  } catch (e) {
    console.error('reservation.list error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// GET /api/reservation/reservation/:resId
router.get('/reservation/:resId', async (req, res) => {
  try {
    const ref = db.collection('reservation').doc(req.params.resId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: 'Reservation not found' });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (e) {
    console.error('reservation.get error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// DELETE /api/reservation/reservation/:resId
router.delete('/reservation/:resId', async (req, res) => {
  try {
    const q = await db.collection('reservation').where('reservationId', '==', req.params.resId).get();
    if (q.empty) return res.status(404).json({ message: 'No reservation found with the specified ID' });
    const batch = db.batch();
    q.forEach(d => batch.delete(d.ref));
    await batch.commit();
    res.status(200).json({ message: `Reservation with id '${req.params.resId}' successfully deleted` });
  } catch (e) {
    console.error('reservation.delete error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

module.exports = router;
