const { db } = require('../config/firebaseConfig');

async function getReservations(req,res){
  const { uid } = req.user; // Assuming user is authenticated and uid is available

  console.log('Received UID in getReservations:', uid); // Log UID for debugging

  try{
    const reservationsSnapshot = await db.collection('reservations').get();
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
  }catch(error){
    console.error('Error fetching reservations: ', error);
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
}

async function deleteReservation(req, res) {
  const { uid } = req.user; // Assuming user is authenticated and uid is available
  console.log('Received UID in deleteReservation:', uid); // Log UID for debugging

  const { reserveId } = req.params;
  console.log('Deleting reservation:', reserveId); 

  try {
      // Query the 'vehicles' collection for documents with the specified name
      const vehiclesSnapshot = await db.collection('reservations')
          .where('reserveId', '==', reserveId)
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

      res.status(200).json({ message: `Reservation with id '${reserveId}' successfully deleted` });
  } catch (error) {
      console.error('Error deleting reservation:', error);
      res.status(500).json({ message: 'Error deleting reservation', error: error.message });
  }
}

module.exports = { getReservations, deleteReservation };