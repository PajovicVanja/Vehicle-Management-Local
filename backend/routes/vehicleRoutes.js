const express = require('express');
const verifyAuthToken = require('../middlewares/authMiddleware');
const { getVehicles, repairVehicle, deleteVehicle, getVehicle, reserveVehicle, getVehicleReservations ,reportMalfunction } = require('../controllers/vehicleController');

const router = express.Router();

// Route to get all vehicles
router.get('/vehicles', verifyAuthToken, getVehicles);

// Route to get one vehicle
router.get('/vehicles/:vehicleId', verifyAuthToken, getVehicle);

// Route to repair a vehicle
router.patch('/vehicles/:vehicleId/repair', verifyAuthToken, repairVehicle);

// Route to reserve a vehicle
router.patch('/vehicles/:vehicleId/reserve', verifyAuthToken, reserveVehicle);

// Route to delete a vehicle by name
router.delete('/vehicles/:vehicleId', verifyAuthToken, deleteVehicle);

router.get('/reservations', verifyAuthToken, getVehicleReservations);

router.post('/report-malfunction', verifyAuthToken, reportMalfunction);


module.exports = router;
