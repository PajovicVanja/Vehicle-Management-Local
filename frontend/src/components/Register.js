import React, { useState } from 'react';
import '../CSS/LoginRegister.css';
import { auth, db } from '../firebaseClient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import UploadLicense from './UploadLicense';

function Register({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showUploadLicense, setShowUploadLicense] = useState(false);
  const [uploadToken, setUploadToken] = useState(null); // <-- keep token for UploadLicense

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get a fresh ID token once
      const idToken = await user.getIdToken();
      setToken(idToken);
      setUploadToken(idToken);

      // Add user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'Driver',
        createdAt: new Date().toISOString(),
      });

      // Show Upload License step
      setShowUploadLicense(true);
      setError('');
    } catch (err) {
      console.error('Error during registration:', err);
      setError(err.message);
    }
  };

  if (showUploadLicense) {
    return <UploadLicense token={uploadToken || ''} />;
  }

  return (
    <div className="login-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button type="submit" className="login-button">
          Register
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Register;
