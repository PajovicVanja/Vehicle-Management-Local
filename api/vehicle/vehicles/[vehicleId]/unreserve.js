// api/vehicle/vehicles/[vehicleId]/unreserve.js
const { db } = require('../../../_lib/firebaseAdmin');
const { verifyAuth } = require('../../../_lib/verifyAuth');

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' });

  const { vehicleId } = req.query;
  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    const ref = db.collection('vehicles').doc(vehicleId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: 'Vehicle not found' });

    const data = snap.data();
    if (data.status === 'available' || data.status === 'repair') {
      return res.status(400).json({ message: 'Cannot change status, vehicle is not reserved.' });
    }

    await ref.update({ status: 'available' });
    res.status(200).json({ message: `Vehicle ${vehicleId} status updated to "available".` });
  } catch (e) {
    console.error('unreserve error:', e);
    res.status(500).json({ message: 'Error updating vehicle status', error: e.message });
  }
};
