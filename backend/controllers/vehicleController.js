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
            hp: vehicleData.hp,
          });
      });
      res.status(200).json(vehiclesList);
    }catch(error){
      console.error('Error fetching vehicles: ', error);
      res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
    }
  }

  module.exports = { getVehicles };