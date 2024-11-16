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

    // Check if the vehicle exists
    if (!docSnapshot.exists) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Get the current status of the vehicle
    const vehicleData = docSnapshot.data();
    let newStatus;

    // Toggle the status based on current value
    if (vehicleData.status === 'available') {
      newStatus = 'repair';
    } else if (vehicleData.status === 'repair') {
      newStatus = 'available';
    } else {
      // If status is anything else, do nothing
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

async function reserveVehicle(req, res) {
  const { uid } = req.user; // Assuming user is authenticated and uid is available
  console.log('Received UID in reserveVehicle:', uid); // Log UID for debugging
  const { vehicleId, reserveId } = req.params;

  try {
      // Find the specific vehicle document by its ID
      const vehicleRef = db.collection('vehicles').doc(vehicleId);

      // Check if the vehicle exists
      const docSnapshot = await vehicleRef.get();
      if (!docSnapshot.exists) {
          return res.status(404).json({ message: 'Vehicle not found' });
      }

      // Get the current status of the vehicle
      const vehicleData = docSnapshot.data();

      // Update the vehicle status
      if (vehicleData.status === 'available') {
        await vehicleRef.update({ status: reserveId });
      }
      else if (vehicleData.status === 'repair') { //cannot reserve vehicle if it is in repair state
        return res.status(400).json({ message: 'Cannot change status, vehicle is on repair.' });
      }
      else{ // if the status is a reserveId, we want to un-reserve it, so set it back to 'available'.
        //TODO: only allow this if the user is an admin, or the same user, who made the reservation
        await vehicleRef.update({ status: 'available' });
      }

      res.status(200).json({ message: 'Vehicle status updated successfully' });
  } catch (error) {
      console.error('Error updating vehicle status:', error);
      res.status(500).json({ message: 'Error updating vehicle status', error: error.message });
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

module.exports = { getVehicles, repairVehicle, deleteVehicle, getVehicle, reserveVehicle };