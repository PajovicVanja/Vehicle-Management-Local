// server/lib/verifyAuth.js
const { admin, db } = require('./firebaseAdmin');

async function verifyAuth(req, res) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      res.status(401).json({ message: 'Authorization token missing' });
      return null;
    }
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // Fetch Firestore role (default Driver)
    let role = 'Driver';
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) role = userDoc.data().role || 'Driver';

    return { uid, role, decoded };
  } catch (e) {
    console.error('Auth verify error:', e);
    res.status(403).json({ message: 'Unauthorized access' });
    return null;
  }
}

// Express helper middleware
async function requireAuth(req, res, next) {
  const user = await verifyAuth(req, res);
  if (!user) return;
  req.user = user;
  next();
}

module.exports = { verifyAuth, requireAuth };
