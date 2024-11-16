// components/Register.js
import React, { useState } from 'react';
import '../CSS/LoginRegister.css';
import { auth, createUserWithEmailAndPassword } from '../firebaseClient';
import { db } from '../firebaseClient';
import { doc, setDoc } from 'firebase/firestore';
import UploadLicense from './UploadLicense'; // Import UploadLicense component

function Register({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showUploadLicense, setShowUploadLicense] = useState(false); // New state

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await user.getIdToken();
      setToken(token);

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'Driver', // Default role
        createdAt: new Date(),
      });

      setShowUploadLicense(true); // Show the license upload UI
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  if (showUploadLicense) {
    // Render UploadLicense component after successful registration
    return <UploadLicense token={auth.currentUser.accessToken} />;
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
