// components/UploadLicense.js
import React, { useState } from 'react';
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
      const result = await uploadLicense(file, token);
      if (result.success) {
        setMessage(result.message || 'Upload successful');
        setLicenseUploaded(true); // should fix issue where the Upload Licence form stays active
      } else {
        setMessage(result.error || 'Upload failed');
      }
    } else {
      setMessage('Please select a file and make sure you are logged in.');
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Driver's License</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <input type="file" onChange={handleFileChange} className="file-input"/>
        <button type="submit" className="upload-button">Upload</button>
      </form>
      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}

export default UploadLicense;
