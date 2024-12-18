// components/Login.js
import React, { useState } from 'react';
import '../CSS/LoginRegister.css';
import { auth, signInWithEmailAndPassword } from '../firebaseClient';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Log in using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the token and role
      const token = await user.getIdTokenResult();
      const role = token.claims.role || 'Driver'; // Default to Driver if no role
      
      localStorage.setItem('userRole', role); // Save role locally for role-based UI
      setToken(token.token); // Set token to be used in the app
      setError('');
    } catch (error) {
      setError(error.message); // Display error message if login fails
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit" className="login-button">Login</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Login;
