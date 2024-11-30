// components/Profile.js
import React, { useState, useEffect } from 'react';
import '../CSS/Profile.css';
import { getUserData, uploadLicense } from '../services/authService';

function Profile({ token, setShowProfile }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [licenseImageUrl, setLicenseImageUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  // Function to fetch and update user data
  const fetchUserData = async () => {
    const result = await getUserData(token);
    if (result.success) {
      setEmail(result.data.email);
      setRole(result.data.role || 'Driver'); // Default role to Driver
      setLicenseImageUrl(result.data.licenseImageUrl);
    } else {
      setMessage(result.error || 'Failed to load profile data');
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [token]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (file) {
      const result = await uploadLicense(file, token);
      if (result.success) {
        setMessage('License uploaded successfully');
        fetchUserData(); // Fetch the updated user data immediately after upload
      } else {
        setMessage(result.error || 'Failed to upload license');
      }
    } else {
      setMessage('Please select a file to upload');
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <p className="profile-email">Email: {email}</p>
      <p className="profile-role">Role: {role}</p>
      {licenseImageUrl ? (
        <div>
          <h3>Your Driver’s License</h3>
          <img src={licenseImageUrl} alt="Driver's License" className="license-image" />
        </div>
      ) : (
        <p className="no-license">No driver's license uploaded yet.</p>
      )}
      <div>
        <h3>Update Driver’s License</h3>
        <form onSubmit={handleUpload}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit" className="upload-button">
            Upload License
          </button>
        </form>
      </div>
      <button onClick={() => setShowProfile(false)} className="goto-register-button">
        Back to Dashboard
      </button>
      {message && <p className="profile-message">{message}</p>}
    </div>
  );
}

export default Profile;
