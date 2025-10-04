// api/vehicle/vehicles/[vehicleId]/reserve.js
const { db } = require('../../../_lib/firebaseAdmin');
const { verifyAuth } = require('../../../_lib/verifyAuth');

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' });

  const { vehicleId } = req.query;
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { startDate, endDate } = req.body || {};
  if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'Start date and end date are required.' });

  try {
    const vRef = db.collection('vehicles').doc(vehicleId);
    const vDoc = await vRef.get();
    if (!vDoc.exists) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

    const v = vDoc.data();
    if (v.status !== 'available') return res.status(400).json({ success: false, message: 'Vehicle is not available for reservation.' });

    const resRef = db.collection('reservation').doc();
    const reservationId = resRef.id;

    await resRef.set({
      reservationId,
      vehicleId,
      userId: user.uid,
      startDate,
      endDate,
      status: 'Active',
      createdAt: new Date()
    });

    await vRef.update({ status: reservationId });

    res.status(201).json({ success: true, message: 'Reservation created successfully.' });
  } catch (e) {
    console.error('reserve error:', e);
    res.status(500).json({ success: false, message: 'Error creating reservation.', error: e.message });
  }
};
