const express = require('express');
const verifyAuthToken = require('../middlewares/authMiddleware');
const { getReservations, deleteReservation } = require('../controllers/reserveController');

const router = express.Router();

// Route to get all reservations
router.get('/vehicles', verifyAuthToken, getReservations);

// Route to delete a vehicle by name
router.delete('/vehicles/:vehicleId', verifyAuthToken, deleteReservation);

module.exports = router;
