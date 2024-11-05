const express = require('express');
const verifyAuthToken = require('../middlewares/authMiddleware');
const { getVehicles } = require('../controllers/vehicleController');

const router = express.Router();

router.get('/vehicles', verifyAuthToken, getVehicles);

module.exports = router;
