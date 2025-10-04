// api/auth/upload-license.js
const formidable = require('formidable');
const cloudinary = require('../_lib/cloudinary');
const { db } = require('../_lib/firebaseAdmin');
const { verifyAuth } = require('../_lib/verifyAuth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    const form = formidable({ multiples: false, keepExtensions: true });
    const { fields, files } = await new Promise((resolve, reject) => {
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
    res.status(200).json({ message: 'License image uploaded successfully', imageUrl });
  } catch (e) {
    console.error('upload-license error:', e);
    res.status(500).json({ message: 'Image upload failed', error: e.message });
  }
};
