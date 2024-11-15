import React, { useState } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import ReserveVehicle from './components/ReserveVehicle';
import AddVehicle from './components/AddVehicle';
import UploadLicense from './components/UploadLicense';
import CurrentReservationsAdmin from './components/CurrentReservationsAdmin';

function App() {
  const [token, setToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAllCarReservations, setShowAllCarReservations] = useState(false);

  return (
    <div>
      <h1>
        {!setShowReserve ? 'Driver Login System' : 'Vehicle Reservation System'}
      </h1>
      {!token ? (
        <>
          {isRegistering ? (
            <Register setToken={setToken} />
          ) : (
            <Login setToken={setToken} />
          )}
          <button
            className="goto-register-button"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Switch to Login' : 'Switch to Register'}
          </button>
        </>
      ) : showAddVehicle ? (
        <AddVehicle token={token} setShowAddVehicle={setShowAddVehicle} />
      ) : showReserve ? (
        <ReserveVehicle
          token={token}
          setShowReserve={setShowReserve}
          setShowAddVehicle={setShowAddVehicle}
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
          <UploadLicense token={token} />
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
            <button
              onClick={() => setShowAllCarReservations(true)}
              className="goto-register-button"
            >
              View All Reservations
            </button>
            <button
              onClick={() => {
                setShowProfile(false);
                setToken(null);
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
