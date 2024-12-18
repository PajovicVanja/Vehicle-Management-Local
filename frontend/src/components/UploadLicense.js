// components/UploadLicense.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../CSS/UploadLicense.css';
import { uploadLicense } from '../services/authService';

function UploadLicense({ token, setLicenseUploaded }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (file && token) {
      try {
        const result = await uploadLicense(file, token);
        if (result.success) {
          setMessage(result.message || 'Upload successful');
          if (setLicenseUploaded) {
            setLicenseUploaded(true); // Update state in the parent component
          }
        } else {
          setMessage(result.error || 'Upload failed');
        }
      } catch (err) {
        setMessage('An error occurred while uploading. Please try again.');
        console.error('[UploadLicense] Error:', err);
      }
    } else {
      setMessage('Please select a file and make sure you are logged in.');
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Driver's License</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="file"
          onChange={handleFileChange}
          className="file-input"
          accept="image/*"
        />
        <button type="submit" className="upload-button">
          Upload
        </button>
      </form>
      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}

UploadLicense.propTypes = {
  token: PropTypes.string.isRequired, // Ensure the token is passed as a string
  setLicenseUploaded: PropTypes.func, // This is optional now to avoid breaking the component
};

export default UploadLicense;
