import React, { useState } from 'react';
import '../CSS/LoginRegister.css';
import { auth, db } from '../firebaseClient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import UploadLicense from './UploadLicense'; // Import UploadLicense component

function Register({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showUploadLicense, setShowUploadLicense] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log('Starting registration...');
    try {
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Registered user UID:', user.uid);

      // Get and set the authentication token
      const token = await user.getIdToken();
      setToken(token);

      // Add user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'Driver', // Default role
        createdAt: new Date().toISOString(), // ISO format for consistency
      });

      console.log('User successfully added to Firestore.');

      // Show Upload License component
      setShowUploadLicense(true);
      setError('');
    } catch (error) {
      console.error('Error during registration:', error);
      setError(error.message);
    }
  };

  if (showUploadLicense) {
    return <UploadLicense token={auth.currentUser?.accessToken || ''} />;
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
