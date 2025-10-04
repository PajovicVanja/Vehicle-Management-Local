// api/auth/profile.js
const { db } = require('../_lib/firebaseAdmin');
const { verifyAuth } = require('../_lib/verifyAuth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) return res.status(404).json({ message: 'User document not found' });

    const data = userDoc.data();
    res.status(200).json({
      email: data.email,
      role: data.role || 'Driver',
      licenseImageUrl: data.licenseImageUrl || null
    });
  } catch (e) {
    console.error('profile error:', e);
    res.status(500).json({ message: 'Error fetching profile', error: e.message });
  }
};
