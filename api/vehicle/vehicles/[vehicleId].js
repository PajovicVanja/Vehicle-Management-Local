// api/vehicle/vehicles/[vehicleId].js
const { db } = require('../../_lib/firebaseAdmin');
const { verifyAuth } = require('../../_lib/verifyAuth');

module.exports = async (req, res) => {
  const { vehicleId } = req.query;
  const method = req.method;

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    if (method === 'GET') {
      const ref = db.collection('vehicles').doc(vehicleId);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ message: 'Vehicle not found' });
      return res.status(200).json({ id: doc.id, ...doc.data() });
    }

    if (method === 'DELETE') {
      // Only Admin can delete
      if (user.role !== 'Admin') return res.status(403).json({ message: 'Only admins can delete vehicles.' });

      const q = await db.collection('vehicles').where('vehicleId', '==', vehicleId).get();
      if (q.empty) return res.status(404).json({ message: 'No vehicle found with the specified ID' });

      const batch = db.batch();
      q.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      return res.status(200).json({ message: `Vehicle(s) with id '${vehicleId}' successfully deleted` });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (e) {
    console.error('vehicle [id] error:', e);
    res.status(500).json({ message: 'Error handling vehicle', error: e.message });
  }
};
