// middlewares/authMiddleware.js
const { admin } = require('../config/firebaseConfig');

const verifyAuthToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    req.user.role = decodedToken.role || 'Driver'; // Default to Driver if no role
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Unauthorized access' });
  }
};

module.exports = verifyAuthToken;
