const { db } = require('../config/firebaseConfig');

async function getReservations(req,res){
  const { uid } = req.user; // Assuming user is authenticated and uid is available

  console.log('Received UID in getReservations:', uid); // Log UID for debugging

  try{
    const reservationsSnapshot = await db.collection('reservation').get();
    const reservationsList = [];

    reservationsSnapshot.forEach((doc)=>{
      const reservationData = doc.data();
      reservationsList.push({
          reservationId: reservationData.reservationId,
          vehicleId: reservationData.vehicleId,
          userId: reservationData.userId,
          startDate: reservationData.startDate,
          endDate: reservationData.endDate,
          status: reservationData.status,
        });
    });
    res.status(200).json(reservationsList);
    //console.log(reservationsList);
  }catch(error){
    console.error('Error fetching reservations: ', error);
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
}

async function getReservation(req,res){
    const { uid } = req.user; // Assuming user is authenticated and uid is available
    console.log('Received UID in getReservation:', uid); // Log UID for debugging
  
    const { resId } = req.params;
  
    try {
      const resRef = db.collection('reservation').doc(resId);
      const doc = await resRef.get();
  
      if (!doc.exists) {
        console.log('reservation not found: ', resId);
        return res.status(404).json({ message: 'Reservation not found' });
      }
  
      res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ message: 'Error fetching vehicle', error: error.message });
    }
  }

async function deleteReservation(req, res) {
  const { uid } = req.user; // Assuming user is authenticated and uid is available
  console.log('Received UID in deleteReservation:', uid); // Log UID for debugging

  const { resId } = req.params;
  console.log('Deleting reservation:', resId); 

  try {
      // Query the 'vehicles' collection for documents with the specified name
      const vehiclesSnapshot = await db.collection('reservation')
          .where('reservationId', '==', resId)
          .get();

      // Check if any matching vehicles were found
      if (vehiclesSnapshot.empty) {
          console.log('Found no reservations with this ID.'); 
          return res.status(404).json({ message: 'No reservation found with the specified ID' });
      }

      // Delete each matching document
      const batch = db.batch();
      vehiclesSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
      });
      await batch.commit();  // Commit the batch delete operation

      res.status(200).json({ message: `Reservation with id '${resId}' successfully deleted` });
  } catch (error) {
      console.error('Error deleting reservation:', error);
      res.status(500).json({ message: 'Error deleting reservation', error: error.message });
  }
}

module.exports = { getReservations, deleteReservation, getReservation };