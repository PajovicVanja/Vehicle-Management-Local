const { admin, db } = require('../config/firebaseConfig');

const verifyAuthToken = async (req, res, next) => {
  // Bypass token verification in test environment
  if (process.env.NODE_ENV === 'test') {
    req.user = {
      uid: 'mock-user-id',
      role: 'Admin', // Mock role
    };
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    // Fetch role directly from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (userDoc.exists) {
      req.user.role = userDoc.data().role || 'Driver'; // Default to Driver
    } else {
      req.user.role = 'Driver';
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Unauthorized access' });
  }
};

module.exports = verifyAuthToken;
