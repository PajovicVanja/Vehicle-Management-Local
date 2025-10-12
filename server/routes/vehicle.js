// server/routes/vehicle.js
const express = require('express');
const { db } = require('../lib/firebaseAdmin');
const { requireAuth } = require('../lib/verifyAuth');

const router = express.Router();

// Require auth for all routes
router.use(requireAuth);

// GET /api/vehicle/vehicles
router.get('/vehicles', async (_req, res) => {
  try {
    const snapshot = await db.collection('vehicles').get();
    const list = snapshot.docs.map(d => d.data());
    res.status(200).json(list);
  } catch (e) {
    console.error('vehicle.list error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// POST /api/vehicle/vehicles  (Admin only)
router.post('/vehicles', async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'Admin') return res.status(403).json({ message: 'Only admins can add vehicles.' });

    const { vehicleName, engine, hp, color, year } = req.body || {};
    if (!vehicleName || !engine || !hp || !color || !year) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const ref = db.collection('vehicles').doc();
    const vehicleId = ref.id;
    const newVehicle = { vehicleId, vehicleName, engine, hp, color, year, status: 'available' };
    await ref.set(newVehicle);

    res.status(201).json({ success: true, data: newVehicle });
  } catch (e) {
    console.error('vehicle.create error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// GET /api/vehicle/vehicles/:vehicleId
router.get('/vehicles/:vehicleId', async (req, res) => {
  try {
    const ref = db.collection('vehicles').doc(req.params.vehicleId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: 'Vehicle not found' });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (e) {
    console.error('vehicle.get error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// DELETE /api/vehicle/vehicles/:vehicleId  (Admin only)
router.delete('/vehicles/:vehicleId', async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'Admin') return res.status(403).json({ message: 'Only admins can delete vehicles.' });

    const q = await db.collection('vehicles').where('vehicleId', '==', req.params.vehicleId).get();
    if (q.empty) return res.status(404).json({ message: 'No vehicle found with the specified ID' });
    const batch = db.batch();
    q.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    res.status(200).json({ message: `Vehicle(s) with id '${req.params.vehicleId}' successfully deleted` });
  } catch (e) {
    console.error('vehicle.delete error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// PATCH /api/vehicle/vehicles/:vehicleId/repair
router.patch('/vehicles/:vehicleId/repair', async (req, res) => {
  try {
    const ref = db.collection('vehicles').doc(req.params.vehicleId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: 'Vehicle not found' });

    const data = snap.data();
    if (data.status !== 'repair') {
      return res.status(400).json({ message: 'Cannot change status, vehicle is not in repair.' });
    }

    await ref.update({ status: 'available' });

    // remove malfunctions for this vehicle
    const m = await db.collection('malfunctions').where('vehicleId', '==', req.params.vehicleId).get();
    if (!m.empty) {
      const batch = db.batch();
      m.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    res.status(200).json({ message: `Vehicle ${req.params.vehicleId} status updated to "available" and malfunction(s) deleted.` });
  } catch (e) {
    console.error('vehicle.repair error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// PATCH /api/vehicle/vehicles/:vehicleId/unreserve
router.patch('/vehicles/:vehicleId/unreserve', async (req, res) => {
  try {
    const ref = db.collection('vehicles').doc(req.params.vehicleId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: 'Vehicle not found' });

    const data = snap.data();
    if (data.status === 'available' || data.status === 'repair') {
      return res.status(400).json({ message: 'Cannot change status, vehicle is not reserved.' });
    }

    await ref.update({ status: 'available' });
    res.status(200).json({ message: `Vehicle ${req.params.vehicleId} status updated to "available".` });
  } catch (e) {
    console.error('vehicle.unreserve error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// PATCH /api/vehicle/vehicles/:vehicleId/reserve
router.patch('/vehicles/:vehicleId/reserve', async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required.' });
    }

    const vRef = db.collection('vehicles').doc(req.params.vehicleId);
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
      vehicleId: req.params.vehicleId,
      userId: req.user.uid,
      startDate,
      endDate,
      status: 'Active',
      createdAt: new Date()
    });

    await vRef.update({ status: reservationId });

    res.status(201).json({ success: true, message: 'Reservation created successfully.' });
  } catch (e) {
    console.error('vehicle.reserve error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// POST /api/vehicle/vehicles/:vehicleId/report-issue
router.post('/vehicles/:vehicleId/report-issue', async (req, res) => {
  try {
    const { description } = req.body || {};
    if (!description) return res.status(400).json({ message: 'Description is required.' });

    const vRef = db.collection('vehicles').doc(req.params.vehicleId);
    const vDoc = await vRef.get();
    if (!vDoc.exists) return res.status(404).json({ message: 'Vehicle not found.' });

    // log malfunction
    await db.collection('malfunctions').doc().set({
      vehicleId: req.params.vehicleId,
      userId: req.user.uid,
      description,
      status: 'Pending',
      createdAt: new Date()
    });

    // set vehicle to repair
    await vRef.update({ status: 'repair' });

    // delete active reservations for this vehicle
    const rQ = await db.collection('reservation')
      .where('vehicleId', '==', req.params.vehicleId)
      .where('status', '==', 'Active')
      .get();

    if (!rQ.empty) {
      const batch = db.batch();
      rQ.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    res.status(201).json({ message: `Issue reported for vehicle ${req.params.vehicleId}, status updated to "repair", and associated reservation deleted.` });
  } catch (e) {
    console.error('vehicle.report-issue error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// GET /api/vehicle/malfunctions
router.get('/malfunctions', async (_req, res) => {
  try {
    const snap = await db.collection('malfunctions').get();
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.status(200).json(list);
  } catch (e) {
    console.error('vehicle.malfunctions error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// GET /api/vehicle/admin-reservations (Admin only)
router.get('/admin-reservations', async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
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
    res.status(200).json({ success: true, data: out });
  } catch (e) {
    console.error('vehicle.admin-reservations error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

module.exports = router;
