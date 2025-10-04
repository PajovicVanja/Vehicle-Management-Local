// api/vehicle/[...path].js
const { db } = require('../_lib/firebaseAdmin');
const { verifyAuth } = require('../_lib/verifyAuth');

module.exports = async (req, res) => {
  // path segments after /api/vehicle/
  const seg = req.query.path;
  const parts = Array.isArray(seg) ? seg : (seg ? [seg] : []);

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    // GET /api/vehicle/vehicles
    if (parts.length === 1 && parts[0] === 'vehicles' && req.method === 'GET') {
      const snapshot = await db.collection('vehicles').get();
      const list = snapshot.docs.map(d => d.data());
      return res.status(200).json(list);
    }

    // GET or DELETE /api/vehicle/vehicles/:vehicleId
    if (parts.length === 2 && parts[0] === 'vehicles') {
      const vehicleId = parts[1];

      if (req.method === 'GET') {
        const ref = db.collection('vehicles').doc(vehicleId);
        const doc = await ref.get();
        if (!doc.exists) return res.status(404).json({ message: 'Vehicle not found' });
        return res.status(200).json({ id: doc.id, ...doc.data() });
      }

      if (req.method === 'DELETE') {
        if (user.role !== 'Admin') {
          return res.status(403).json({ message: 'Only admins can delete vehicles.' });
        }
        const q = await db.collection('vehicles').where('vehicleId', '==', vehicleId).get();
        if (q.empty) return res.status(404).json({ message: 'No vehicle found with the specified ID' });
        const batch = db.batch();
        q.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        return res.status(200).json({ message: `Vehicle(s) with id '${vehicleId}' successfully deleted` });
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    // PATCH actions on /api/vehicle/vehicles/:vehicleId/(reserve|unreserve|repair)
    if (parts.length === 3 && parts[0] === 'vehicles') {
      const vehicleId = parts[1];
      const action = parts[2];

      // PATCH /repair
      if (action === 'repair' && req.method === 'PATCH') {
        const ref = db.collection('vehicles').doc(vehicleId);
        const snap = await ref.get();
        if (!snap.exists) return res.status(404).json({ message: 'Vehicle not found' });

        const data = snap.data();
        if (data.status !== 'repair') {
          return res.status(400).json({ message: 'Cannot change status, vehicle is not in repair.' });
        }

        await ref.update({ status: 'available' });

        // remove malfunctions for this vehicle
        const m = await db.collection('malfunctions').where('vehicleId', '==', vehicleId).get();
        if (!m.empty) {
          const batch = db.batch();
          m.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }

        return res.status(200).json({ message: `Vehicle ${vehicleId} status updated to "available" and malfunction(s) deleted.` });
      }

      // PATCH /unreserve
      if (action === 'unreserve' && req.method === 'PATCH') {
        const ref = db.collection('vehicles').doc(vehicleId);
        const snap = await ref.get();
        if (!snap.exists) return res.status(404).json({ message: 'Vehicle not found' });

        const data = snap.data();
        if (data.status === 'available' || data.status === 'repair') {
          return res.status(400).json({ message: 'Cannot change status, vehicle is not reserved.' });
        }

        await ref.update({ status: 'available' });
        return res.status(200).json({ message: `Vehicle ${vehicleId} status updated to "available".` });
      }

      // PATCH /reserve
      if (action === 'reserve' && req.method === 'PATCH') {
        const { startDate, endDate } = req.body || {};
        if (!startDate || !endDate) {
          return res.status(400).json({ success: false, message: 'Start date and end date are required.' });
        }

        const vRef = db.collection('vehicles').doc(vehicleId);
        const vDoc = await vRef.get();
        if (!vDoc.exists) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

        const v = vDoc.data();
        if (v.status !== 'available') {
          return res.status(400).json({ success: false, message: 'Vehicle is not available for reservation.' });
        }

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

        return res.status(201).json({ success: true, message: 'Reservation created successfully.' });
      }

      // POST /report-issue
      if (action === 'report-issue' && req.method === 'POST') {
        const { description } = req.body || {};
        if (!description) return res.status(400).json({ message: 'Description is required.' });

        const vRef = db.collection('vehicles').doc(vehicleId);
        const vDoc = await vRef.get();
        if (!vDoc.exists) return res.status(404).json({ message: 'Vehicle not found.' });

        // log malfunction
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

        return res.status(201).json({ message: `Issue reported for vehicle ${vehicleId}, status updated to "repair", and associated reservation deleted.` });
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    // GET /api/vehicle/malfunctions
    if (parts.length === 1 && parts[0] === 'malfunctions' && req.method === 'GET') {
      const snap = await db.collection('malfunctions').get();
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.status(200).json(list);
    }

    // GET /api/vehicle/admin-reservations (Admin only)
    if (parts.length === 1 && parts[0] === 'admin-reservations' && req.method === 'GET') {
      if (user.role !== 'Admin') {
        return res.status(403).json({ message: 'Unauthorized access. Only admins can view reservations.' });
      }
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
      return res.status(200).json({ success: true, data: out });
    }

    return res.status(404).json({ message: 'Not found' });
  } catch (e) {
    console.error('vehicle catch-all error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
};
