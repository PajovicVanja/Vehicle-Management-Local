// api/vehicle/admin-reservations.js
const { db } = require('../_lib/firebaseAdmin');
const { verifyAuth } = require('../_lib/verifyAuth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const user = await verifyAuth(req, res);
  if (!user) return;
  if (user.role !== 'Admin') return res.status(403).json({ message: 'Unauthorized access. Only admins can view reservations.' });

  try {
    const snap = await db.collection('reservation').get();
    const out = [];
    for (const doc of snap.docs) {
      const r = doc.data();
      let vehicle = null;
      if (r.vehicleId) {
        const v = await db.collection('vehicles').doc(r.vehicleId).get();
        vehicle = v.exists ? v.data() : null;
      }
      let userData = null;
      if (r.userId) {
        const u = await db.collection('users').doc(r.userId).get();
        userData = u.exists ? u.data() : null;
      }
      out.push({
        reservationId: r.reservationId,
        startDate: r.startDate,
        endDate: r.endDate,
        status: r.status,
        user: userData ? { email: userData.email || 'N/A', licenseImageUrl: userData.licenseImageUrl || null } : { email: 'N/A', licenseImageUrl: null },
        vehicle: vehicle ? { vehicleName: vehicle.vehicleName || 'N/A', color: vehicle.color || 'N/A', engine: vehicle.engine || 'N/A' } : { vehicleName: 'N/A', color: 'N/A', engine: 'N/A' }
      });
    }
    res.status(200).json({ success: true, data: out });
  } catch (e) {
    console.error('admin-reservations error:', e);
    res.status(500).json({ success: false, message: 'Error fetching reservations.', error: e.message });
  }
};
