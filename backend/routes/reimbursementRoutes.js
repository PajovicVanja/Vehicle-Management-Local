const express = require('express');
const {
  submitReimbursement,
  getPendingReimbursements,
  updateReimbursementStatus,
} = require('../controllers/reimbursementController');
const verifyAuthToken = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/submit', verifyAuthToken, uploadMiddleware.single('invoiceImage'), submitReimbursement);
router.get('/pending', verifyAuthToken, getPendingReimbursements);
router.patch('/update-status', verifyAuthToken, updateReimbursementStatus);

module.exports = router;
