// api/auth/[...path].js
const formidable = require('formidable');
const cloudinary = require('../_lib/cloudinary');
const { db } = require('../_lib/firebaseAdmin');
const { verifyAuth } = require('../_lib/verifyAuth');
const { setCors, handlePreflight } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return; // OPTIONS
setCors(req, res);  
const seg = req.query.path;
  const parts = Array.isArray(seg) ? seg : (seg ? [seg] : []);

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    // GET /api/auth/profile
    if (parts.length === 1 && parts[0] === 'profile' && req.method === 'GET') {
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (!userDoc.exists) return res.status(404).json({ message: 'User document not found' });

      const data = userDoc.data();
      return res.status(200).json({
        email: data.email,
        role: data.role || 'Driver',
        licenseImageUrl: data.licenseImageUrl || null
      });
    }

    // POST /api/auth/upload-license
    if (parts.length === 1 && parts[0] === 'upload-license' && req.method === 'POST') {
      const form = formidable({ multiples: false, keepExtensions: true });
      const { files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
      });

      const file = files.licenseImage;
      if (!file) return res.status(400).json({ message: 'No file uploaded' });

      const upload = await cloudinary.uploader.upload(file.filepath, {
        folder: `licenses/${user.uid}`
      });

      const imageUrl = upload.secure_url;

      const ref = db.collection('users').doc(user.uid);
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ message: 'User document not found' });

      await ref.update({ licenseImageUrl: imageUrl });
      return res.status(200).json({ message: 'License image uploaded successfully', imageUrl });
    }

    return res.status(404).json({ message: 'Not found' });
  } catch (e) {
    console.error('auth catch-all error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
};
