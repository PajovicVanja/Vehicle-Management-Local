const express = require('express');
const verifyAuthToken = require('../middlewares/authMiddleware');
const { getReservations, deleteReservation, getReservation } = require('../controllers/reserveController');

const router = express.Router();

// Route to get all reservations
router.get('/reservation', verifyAuthToken, getReservations);

// Route to get one reservation
router.get('/reservation/:resId', verifyAuthToken, getReservation);

// Route to delete a reservation by name
router.delete('/reservation/:resId', verifyAuthToken, deleteReservation);

module.exports = router;
