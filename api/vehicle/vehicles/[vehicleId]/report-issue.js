// api/vehicle/vehicles/[vehicleId]/report-issue.js
const { db } = require('../../../_lib/firebaseAdmin');
const { verifyAuth } = require('../../../_lib/verifyAuth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { vehicleId } = req.query;
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { description } = req.body || {};
  if (!description) return res.status(400).json({ message: 'Description is required.' });

  try {
    const vRef = db.collection('vehicles').doc(vehicleId);
    const vDoc = await vRef.get();
    if (!vDoc.exists) return res.status(404).json({ message: 'Vehicle not found.' });

    // Log malfunction
    await db.collection('malfunctions').doc().set({
      vehicleId,
      userId: user.uid,
      description,
      status: 'Pending',
      createdAt: new Date()
    });

    // set vehicle to repair
    await vRef.update({ status: 'repair' });

    // delete active reservations for this vehicle
    const rQ = await db.collection('reservation')
      .where('vehicleId', '==', vehicleId)
      .where('status', '==', 'Active')
      .get();

    if (!rQ.empty) {
      const batch = db.batch();
      rQ.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    res.status(201).json({ message: `Issue reported for vehicle ${vehicleId}, status updated to "repair", and associated reservation deleted.` });
  } catch (e) {
    console.error('report-issue error:', e);
    res.status(500).json({ message: 'Error reporting vehicle issue.', error: e.message });
  }
};

