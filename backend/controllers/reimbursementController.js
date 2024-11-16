// controllers/reimbursementController.js
const { db } = require('../config/firebaseConfig');

async function submitReimbursement(req, res) {
  const { uid } = req.user;
  const { cost, description } = req.body;
  const file = req.file; // Invoice image

  if (!file) {
    return res.status(400).json({ message: 'Invoice image is required.' });
  }

  try {
    // Save image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `reimbursements/${uid}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    const imageUrl = result.secure_url;

    // Create a new reimbursement request
    await db.collection('reimbursements').add({
      userId: uid,
      cost,
      description,
      imageUrl,
      status: 'Pending', // Default status
      createdAt: new Date(),
    });

    res.status(201).json({ message: 'Reimbursement request submitted successfully.' });
  } catch (error) {
    console.error('Error submitting reimbursement:', error);
    res.status(500).json({ message: 'Error submitting reimbursement request.', error: error.message });
  }
}

async function getPendingReimbursements(req, res) {
  const { role } = req.user;

  if (role !== 'Manager') {
    return res.status(403).json({ message: 'Only managers can review reimbursements.' });
  }

  try {
    const snapshot = await db.collection('reimbursements').where('status', '==', 'Pending').get();
    const reimbursements = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(reimbursements);
  } catch (error) {
    console.error('Error fetching reimbursements:', error);
    res.status(500).json({ message: 'Error fetching reimbursements.', error: error.message });
  }
}

async function updateReimbursementStatus(req, res) {
  const { role } = req.user;
  const { id, status } = req.body;

  if (role !== 'Manager') {
    return res.status(403).json({ message: 'Only managers can update reimbursement status.' });
  }

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status update.' });
  }

  try {
    const reimbursementRef = db.collection('reimbursements').doc(id);
    await reimbursementRef.update({ status });

    res.status(200).json({ message: `Reimbursement request ${status}.` });
  } catch (error) {
    console.error('Error updating reimbursement status:', error);
    res.status(500).json({ message: 'Error updating reimbursement status.', error: error.message });
  }
}

module.exports = { submitReimbursement, getPendingReimbursements, updateReimbursementStatus };
