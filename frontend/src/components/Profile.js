// components/Profile.js
import React, { useState, useEffect } from 'react';
import { getUserData } from '../services/authService';

function Profile({ token, setShowProfile }) {
  const [email, setEmail] = useState('');
  const [licenseImageUrl, setLicenseImageUrl] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const result = await getUserData(token);
      if (result.success) {
        setEmail(result.data.email);
        setLicenseImageUrl(result.data.licenseImageUrl);
      } else {
        setMessage(result.error || 'Failed to load profile data');
      }
    };
    fetchData();
  }, [token]);

  return (
    <div>
      <h2>Profile</h2>
      <p>Email: {email}</p>
      {licenseImageUrl ? (
        <div>
          <h3>Your Driver’s License</h3>
          <img src={licenseImageUrl} alt="Driver's License" style={{ width: '200px' }} />
        </div>
      ) : (
        <p>No driver's license uploaded yet.</p>
      )}
      <button onClick={() => setShowProfile(false)}>Back to Dashboard</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Profile;
