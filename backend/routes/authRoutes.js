// routes/authRoutes.js
const express = require('express');
const { uploadLicenseImage, getProfile, registerUser } = require('../controllers/authController');
const verifyAuthToken = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/upload-license', verifyAuthToken, uploadMiddleware.single('licenseImage'), uploadLicenseImage);
router.get('/profile', verifyAuthToken, getProfile);
router.post('/register', registerUser); // Register user with a role

module.exports = router;
