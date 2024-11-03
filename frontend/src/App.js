// App.js
import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import UploadLicense from './components/UploadLicense';

function App() {
  const [token, setToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div>
      <h1>Driver Login System</h1>
      {!token ? (
        <>
          {isRegistering ? (
            <Register setToken={setToken} />
          ) : (
            <Login setToken={setToken} />
          )}
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Switch to Login' : 'Switch to Register'}
          </button>
        </>
      ) : showProfile ? (
        <Profile token={token} setShowProfile={setShowProfile} />
      ) : (
        <div>
          <button onClick={() => setShowProfile(true)}>View Profile</button>
          <UploadLicense token={token} />
        </div>
      )}
    </div>
  );
}

export default App;
