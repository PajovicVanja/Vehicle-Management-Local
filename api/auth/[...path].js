// api/auth/[...path].js
const { IncomingForm } = require('formidable');
const cloudinary = require('../_lib/cloudinary');
const { db } = require('../_lib/firebaseAdmin');
const { verifyAuth } = require('../_lib/verifyAuth');
const { setCors, handlePreflight } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return; // OPTIONS
  setCors(req, res);

  // Resolve catch-all segments whether they come via query or the raw URL
  const seg = req.query && req.query.path;
  const parts = Array.isArray(seg)
    ? seg
    : seg
    ? String(seg).split('/').filter(Boolean)
    : req.url
        .split('?')[0]
        .replace(/^\/api\/auth\/?/, '')
        .split('/')
        .filter(Boolean);

  // All auth routes require a valid Firebase token
  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    // GET /api/auth/profile
    if (req.method === 'GET' && parts.length === 1 && parts[0] === 'profile') {
      const snap = await db.collection('users').doc(user.uid).get();
      if (!snap.exists) {
        return res.status(404).json({ message: 'User document not found' });
      }
      const data = snap.data() || {};
      return res.status(200).json({
        email: data.email || null,
        role: data.role || 'Driver',
        licenseImageUrl: data.licenseImageUrl || null
      });
    }

    // POST /api/auth/upload-license
    if (req.method === 'POST' && parts.length === 1 && parts[0] === 'upload-license') {
      // Formidable v3: use IncomingForm (the old callable default is gone)
      const form = new IncomingForm({
        multiples: false,
        keepExtensions: true,
        allowEmptyFiles: false,
        maxFileSize: 10 * 1024 * 1024 // 10MB
      });

      const { files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
      });

      // Support single or array, and be tolerant with field name
      const maybeFile = files && (files.licenseImage ?? files.file ?? files.upload);
      const file = Array.isArray(maybeFile) ? maybeFile[0] : maybeFile;

      if (!file || !file.filepath) {
        return res.status(400).json({ message: 'No file uploaded (expected field "licenseImage").' });
      }

      // Upload to Cloudinary using the temp file path
      const upload = await cloudinary.uploader.upload(file.filepath, {
        folder: `licenses/${user.uid}`,
        resource_type: 'image'
      });

      const imageUrl = upload.secure_url;

      // Persist on the user's document
      const ref = db.collection('users').doc(user.uid);
      const snap = await ref.get();
      if (!snap.exists) {
        return res.status(404).json({ message: 'User document not found' });
      }

      await ref.update({ licenseImageUrl: imageUrl });

      return res.status(200).json({ message: 'License image uploaded successfully', imageUrl });
    }

    return res.status(404).json({ message: 'Not found' });
  } catch (e) {
    console.error('auth catch-all error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
};
