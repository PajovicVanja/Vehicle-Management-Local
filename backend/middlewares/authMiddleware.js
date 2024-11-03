// middlewares/authMiddleware.js
const { admin } = require('../config/firebaseConfig');

const verifyAuthToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Check for "Bearer <token>"

  if (!token) {
    console.log('Authorization token missing');
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to request
    console.log('Decoded UID:', decodedToken.uid); // Log the UID for debugging
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Unauthorized access' });
  }
};

module.exports = verifyAuthToken;
