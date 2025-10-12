// server/routes/auth.js
const express = require('express');
const { IncomingForm } = require('formidable');
const cloudinary = require('../lib/cloudinary');
const { db } = require('../lib/firebaseAdmin');
const { requireAuth } = require('../lib/verifyAuth');

const router = express.Router();

// GET /api/auth/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('users').doc(req.user.uid).get();
    if (!snap.exists) return res.status(404).json({ message: 'User document not found' });
    const data = snap.data() || {};
    res.status(200).json({
      email: data.email || null,
      role: data.role || 'Driver',
      licenseImageUrl: data.licenseImageUrl || null
    });
  } catch (e) {
    console.error('auth.profile error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// POST /api/auth/upload-license
router.post('/upload-license', requireAuth, async (req, res) => {
  try {
    const form = new IncomingForm({
      multiples: false,
      keepExtensions: true,
      allowEmptyFiles: false,
      maxFileSize: 10 * 1024 * 1024 // 10MB
    });

    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    const maybeFile = files && (files.licenseImage ?? files.file ?? files.upload);
    const file = Array.isArray(maybeFile) ? maybeFile[0] : maybeFile;
    if (!file || !file.filepath) {
      return res.status(400).json({ message: 'No file uploaded (expected field "licenseImage").' });
    }

    const upload = await cloudinary.uploader.upload(file.filepath, {
      folder: `licenses/${req.user.uid}`,
      resource_type: 'image'
    });

    const imageUrl = upload.secure_url;

    const ref = db.collection('users').doc(req.user.uid);
    const snap = await ref.get();
    if (!snap.exists) {
      return res.status(404).json({ message: 'User document not found' });
    }

    await ref.update({ licenseImageUrl: imageUrl });
    res.status(200).json({ message: 'License image uploaded successfully', imageUrl });
  } catch (e) {
    console.error('auth.upload-license error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

module.exports = router;
