const { report } = require('..');
const { db } = require('../config/firebaseConfig');

async function getVehicles(req,res){
  const { uid } = req.user; // Assuming user is authenticated and uid is available

  console.log('Received UID in getVehicles:', uid); // Log UID for debugging

  try{
    const vehiclesSnapshot = await db.collection('vehicles').get();
    const vehiclesList = [];

    vehiclesSnapshot.forEach((doc)=>{
      const vehicleData = doc.data();
      vehiclesList.push({
          vehicleId: vehicleData.vehicleId,
          vehicleName: vehicleData.vehicleName,
          color: vehicleData.color,
          year: vehicleData.year,
          image: vehicleData.image,
          engine: vehicleData.engine,
          hp: vehicleData.hp,
          status: vehicleData.status,
        });
    });
    res.status(200).json(vehiclesList);
  }catch(error){
    console.error('Error fetching vehicles: ', error);
    res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
  }
}

async function getVehicle(req,res){
  const { uid } = req.user; // Assuming user is authenticated and uid is available
  console.log('Received UID in getVehicle:', uid); // Log UID for debugging

  const { vehicleId } = req.params;

  try {
    const vehicleRef = db.collection('vehicles').doc(vehicleId);
    const doc = await vehicleRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Error fetching vehicle', error: error.message });
  }
}

async function repairVehicle(req, res) {
  const { uid } = req.user; // Assuming user is authenticated and uid is available
  console.log('Received UID in repairVehicle:', uid); // Log UID for debugging

  const { vehicleId } = req.params;  // Get the vehicle ID from the route
  
  try {
    // Get the vehicle document from Firestore
    const vehicleRef = db.collection('vehicles').doc(vehicleId);
    const docSnapshot = await vehicleRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Get the current status of the vehicle
    const vehicleData = docSnapshot.data();
    let newStatus;

    if (vehicleData.status === 'available') {
      newStatus = 'repair';
    } else if (vehicleData.status === 'repair') {
      newStatus = 'available';
    } else {
      return res.status(400).json({ message: 'Cannot change status, vehicle is reserved.' });
    }

    // Update the status in Firestore
    await vehicleRef.update({ status: newStatus });
    
    res.status(200).json({ message: `Vehicle ${vehicleId} status updated to "${newStatus}".` });
  } catch (error) {
    console.error('Error updating vehicle status:', error);
    res.status(500).json({ message: 'Error updating vehicle status', error: error.message });
  }
}



async function unreserveVehicle(req,res){
  const { uid } = req.user; // Assuming user is authenticated and uid is available
  console.log('Received UID in unreserveVehicle:', uid); // Log UID for debugging

  const { vehicleId } = req.params;  // Get the vehicle ID from the route
  
  try {
    // Get the vehicle document from Firestore
    const vehicleRef = db.collection('vehicles').doc(vehicleId);
    const docSnapshot = await vehicleRef.get();

    // Check if the vehicle exists
    if (!docSnapshot.exists) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Get the current status of the vehicle
    const vehicleData = docSnapshot.data();
    let newStatus;

    // Toggle the status based on current value
    if (vehicleData.status != 'available' && vehicleData.status != 'repair') {
      newStatus = 'available';
    } else {
      // If status is anything else, do nothing
      return res.status(400).json({ message: 'Cannot change status, vehicle is not reserved.' });
    }

    // Update the status in Firestore
    await vehicleRef.update({ status: newStatus });
    
    res.status(200).json({ message: `Vehicle ${vehicleId} status updated to "${newStatus}".` });
  } catch (error) {
    console.error('Error updating vehicle status:', error);
    res.status(500).json({ message: 'Error updating vehicle status', error: error.message });
  }
}

async function reserveVehicle(req, res) {
  console.log('[reserveVehicle] Received request to reserve vehicle.');
  const { uid } = req.user;
  const { vehicleId } = req.params;
  const { startDate, endDate } = req.body; // Get from body

  console.log('[reserveVehicle] UID:', uid);
  console.log('[reserveVehicle] Vehicle ID:', vehicleId);
  console.log('[reserveVehicle] Start Date:', startDate, 'End Date:', endDate);

  if (!startDate || !endDate) {
    console.error('[reserveVehicle] Missing startDate or endDate.');
    return res.status(400).json({ success: false, message: 'Start date and end date are required.' });
  }

  try {
    const vehicleRef = db.collection('vehicles').doc(vehicleId);
    const vehicleDoc = await vehicleRef.get();

    if (!vehicleDoc.exists) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const vehicleData = vehicleDoc.data();

    if (vehicleData.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Vehicle is not available for reservation.' });
    }

    const reservationRef = db.collection('reservation').doc();
    const reservationId = reservationRef.id;

    await reservationRef.set({
      reservationId,
      vehicleId,
      userId: uid,
      startDate,
      endDate,
      status: 'Active',
      createdAt: new Date(),
    });

    await vehicleRef.update({ status: reservationId });

    console.log(`[reserveVehicle] Vehicle ${vehicleId} status updated to reservation ID: ${reservationId}`);
    res.status(201).json({ success: true, message: 'Reservation created successfully.' });
  } catch (error) {
    console.error('[reserveVehicle] Error during reservation process:', error);
    res.status(500).json({ success: false, message: 'Error creating reservation.', error: error.message });
  }
}







async function deleteVehicle(req, res) {
  const { uid } = req.user; // Assuming user is authenticated and uid is available
  console.log('Received UID in deleteVehicle:', uid); // Log UID for debugging

  const { vehicleId } = req.params;
  console.log('Deleting vehicle:', vehicleId); 

  try {
      // Query the 'vehicles' collection for documents with the specified name
      const vehiclesSnapshot = await db.collection('vehicles')
          .where('vehicleId', '==', vehicleId)
          .get();

      // Check if any matching vehicles were found
      if (vehiclesSnapshot.empty) {
          console.log('Found no vehicles with this ID.'); 
          return res.status(404).json({ message: 'No vehicle found with the specified ID' });
      }

      // Delete each matching document
      const batch = db.batch();
      vehiclesSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
      });
      await batch.commit();  // Commit the batch delete operation

      res.status(200).json({ message: `Vehicle(s) with id '${vehicleId}' successfully deleted` });
  } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
  }
}

async function getVehicleReservations(req, res) {
  const { role } = req.user;

  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Only admins can view reservations.' });
  }

  try {
    const snapshot = await db.collection('reservation').get();
    const reservations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations.', error: error.message });
  }
}

async function reportMalfunction(req, res) {
  const { uid } = req.user;
  const { vehicleId, description } = req.body;

  try {
    await db.collection('malfunctions').add({
      userId: uid,
      vehicleId,
      description,
      status: 'Pending',
      createdAt: new Date(),
    });

    // Example: Sending a notification (placeholder, replace with FCM logic)
    console.log(`Notification sent to Admin: Malfunction reported for vehicle ${vehicleId}.`);

    res.status(201).json({ message: 'Malfunction reported successfully.' });
  } catch (error) {
    console.error('Error reporting malfunction:', error);
    res.status(500).json({ message: 'Error reporting malfunction.', error: error.message });
  }
}

async function getAdminReservations(req, res) {
  const { role } = req.user;

  if (role !== 'Admin') {
    console.error('[getAdminReservations] Unauthorized access.');
    return res.status(403).json({ message: 'Unauthorized access. Only admins can view reservations.' });
  }

  try {
    console.log('[getAdminReservations] Fetching all reservations.');

    const reservationsSnapshot = await db.collection('reservation').get();
    const reservations = [];

    for (const doc of reservationsSnapshot.docs) {
      const reservationData = doc.data();
      console.log(`[getAdminReservations] Processing reservation: ${reservationData.reservationId}`);

      // Fetch associated vehicle
      let vehicleData = null;
      if (reservationData.vehicleId) {
        const vehicleSnapshot = await db.collection('vehicles').doc(reservationData.vehicleId).get();
        vehicleData = vehicleSnapshot.exists ? vehicleSnapshot.data() : null;
      }

      // Fetch associated user
      let userData = null;
      if (reservationData.userId) {
        const userSnapshot = await db.collection('users').doc(reservationData.userId).get();
        userData = userSnapshot.exists ? userSnapshot.data() : null;
      }

      reservations.push({
        reservationId: reservationData.reservationId,
        startDate: reservationData.startDate,
        endDate: reservationData.endDate,
        status: reservationData.status,
        user: userData
          ? {
              email: userData.email || 'N/A',
              licenseImageUrl: userData.licenseImageUrl || null,
            }
          : { email: 'N/A', licenseImageUrl: null },
        vehicle: vehicleData
          ? {
              vehicleName: vehicleData.vehicleName || 'N/A',
              color: vehicleData.color || 'N/A',
              engine: vehicleData.engine || 'N/A',
            }
          : { vehicleName: 'N/A', color: 'N/A', engine: 'N/A' },
      });
    }

    console.log('[getAdminReservations] Completed processing reservations.');
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    console.error('[getAdminReservations] Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations.',
      error: error.message,
    });
  }
}

async function reportVehicleIssue(req, res) {
  console.log('Received request to report issue:', req.body); // Log request body
  console.log('Authenticated user:', req.user); // Log authenticated user

  const { uid } = req.user; // Authenticated user's UID
  const { vehicleId } = req.params; // Vehicle ID from route parameters
  const { description } = req.body; // Issue description from request body

  if (!description) {
    return res.status(400).json({ message: 'Description is required.' });
  }

  try {
    // Log vehicle ID and description for debugging
    console.log('Vehicle ID:', vehicleId);
    console.log('Description:', description);

    // Get the vehicle document from Firestore
    const vehicleRef = db.collection('vehicles').doc(vehicleId);
    const vehicleDoc = await vehicleRef.get();

    if (!vehicleDoc.exists) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    const vehicleData = vehicleDoc.data();

    // Add the issue to the "malfunctions" collection
    const malfunctionRef = db.collection('malfunctions').doc();
    await malfunctionRef.set({
      vehicleId,
      userId: uid,
      description,
      status: 'Pending', // Default status
      createdAt: new Date(),
    });

    console.log('Malfunction logged successfully'); // Confirm malfunction logged

    // Update the vehicle's status to "repair"
    await vehicleRef.update({ status: 'repair' });

    console.log('Vehicle status updated to "repair"'); // Confirm status update

    // Delete the associated reservation
    const reservationQuery = db
      .collection('reservation')
      .where('vehicleId', '==', vehicleId)
      .where('status', '==', 'Active'); // Ensure only active reservations are deleted
    const reservations = await reservationQuery.get();

    if (!reservations.empty) {
      const batch = db.batch();
      reservations.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log('Associated reservation(s) deleted successfully');
    } else {
      console.log('No active reservations found for this vehicle.');
    }

    res.status(201).json({
      message: `Issue reported for vehicle ${vehicleId}, status updated to "repair", and associated reservation deleted.`,
    });
  } catch (error) {
    console.error('Error reporting vehicle issue:', error);
    res.status(500).json({
      message: 'Error reporting vehicle issue.',
      error: error.message,
    });
  }
}

async function getMalfunctionData(req, res) {
  try {
    const snapshot = await db.collection('malfunctions').get();
    const malfunctions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(malfunctions);
  } catch (error) {
    console.error('Error fetching malfunction data:', error);
    res.status(500).json({ message: 'Error fetching malfunction data.', error: error.message });
  }
}

module.exports = { getVehicles, repairVehicle, deleteVehicle, getVehicle, reserveVehicle, getVehicleReservations, 
  reportMalfunction, getAdminReservations, unreserveVehicle, reportVehicleIssue, getMalfunctionData };