// middlewares/uploadMiddleware.js
const multer = require('multer');

// Use memory storage to avoid saving files locally
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
