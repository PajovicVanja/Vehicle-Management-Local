// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import ReserveVehicle from './components/ReserveVehicle';
import AddVehicle from './components/AddVehicle';
import UploadLicense from './components/UploadLicense';
import CurrentReservationsAdmin from './components/CurrentReservationsAdmin';
import { getUserData } from './services/authService';

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAllCarReservations, setShowAllCarReservations] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (token) {
        const userData = await getUserData(token);
        if (userData.success) {
          setRole(userData.data.role || 'Driver');
          setLicenseUploaded(!!userData.data.licenseImageUrl);
        }
      }
    };
    fetchRole();
  }, [token]);

  return (
    <div>
      <h1>Vehicle Management System</h1>
      {!token ? (
        <>
          {showRegister ? (
            <Register setToken={setToken} />
          ) : (
            <Login setToken={setToken} />
          )}
          <button
            className="goto-register-button"
            onClick={() => setShowRegister(!showRegister)}
          >
            {showRegister ? 'Switch to Login' : 'Switch to Register'}
          </button>
        </>
      ) : showAddVehicle ? (
        <AddVehicle token={token} setShowAddVehicle={setShowAddVehicle} />
      ) : showReserve ? (
        <ReserveVehicle
          token={token}
          setShowReserve={setShowReserve}
          setShowAddVehicle={setShowAddVehicle}
          setShowAllCarReservations={setShowAllCarReservations}
        />
      ) : showProfile ? (
        <Profile token={token} setShowProfile={setShowProfile} />
      ) : showAllCarReservations ? (
        <CurrentReservationsAdmin
          token={token}
          setShowAllCarReservations={setShowAllCarReservations}
        />
      ) : (
        <div className="menu-group">
          {role === 'Driver' && !licenseUploaded && (
            <UploadLicense token={token} />
          )}
          <div className="button-group">
            <button
              onClick={() => setShowProfile(true)}
              className="goto-register-button"
            >
              View Profile
            </button>
            <button
              onClick={() => setShowReserve(true)}
              className="goto-register-button"
            >
              Reserve Vehicle
            </button>
            {(role === 'Admin' || role === 'Manager') && (
              <button
                onClick={() => setShowAllCarReservations(true)}
                className="goto-register-button"
              >
                View All Reservations
              </button>
            )}
            <button
              onClick={() => {
                setToken(null);
                setRole('');
              }}
              className="goto-register-button"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
