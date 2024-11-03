// config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dp1o8pfsn', // Replace with your Cloudinary cloud name
  api_key: '749858336563791', // Replace with your Cloudinary API key
  api_secret: 'FU78Z4jwioQ89l4jfX9lGzqIoEg' // Replace with your Cloudinary API secret
});

module.exports = cloudinary;
