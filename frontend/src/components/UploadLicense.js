// components/UploadLicense.js
import React, { useState } from 'react';
import { uploadLicense } from '../services/authService';

function UploadLicense({ token }) {
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
      } else {
        setMessage(result.error || 'Upload failed');
      }
    } else {
      setMessage('Please select a file and make sure you are logged in.');
    }
  };

  return (
    <div>
      <h2>Upload Driver's License</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default UploadLicense;
