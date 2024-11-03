// controllers/authController.js
const { db } = require('../config/firebaseConfig');
const cloudinary = require('../config/cloudinaryConfig'); // Import configured Cloudinary instance

async function uploadLicenseImage(req, res) {
  const { uid } = req.user; // Assuming user is authenticated and uid is available
  const file = req.file;

  console.log('Received UID in uploadLicenseImage:', uid); // Log UID for debugging

  if (!file) {
    console.log('No file uploaded or file path missing');
    return res.status(400).json({ message: 'No file uploaded or file path missing' });
  }

  try {
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `licenses/${uid}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer); // Use buffer as file is stored in memory
    });

    const imageUrl = result.secure_url;
    console.log('Image uploaded to Cloudinary. URL:', imageUrl); // Log Cloudinary URL

    // Check if user document exists before updating
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      console.log('User document not found for UID:', uid); // Log UID if document is missing
      return res.status(404).json({ message: 'User document not found' });
    }

    // Update the Firestore document with the image URL
    await userDocRef.update({ licenseImageUrl: imageUrl });
    console.log('User document updated successfully with license image URL');

    res.status(200).json({ message: 'License image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Error during image upload:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
}

async function getProfile(req, res) {
  const { uid } = req.user;

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User document not found' });
    }

    const userData = userDoc.data();
    res.status(200).json({
      email: userData.email,
      licenseImageUrl: userData.licenseImageUrl || null,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
}

module.exports = { uploadLicenseImage, getProfile };
