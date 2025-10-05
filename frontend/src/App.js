import React, { useState, useEffect } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import ReserveVehicle from './components/ReserveVehicle';
import AddVehicle from './components/AddVehicle';
import UploadLicense from './components/UploadLicense';
import CurrentReservationsAdmin from './components/CurrentReservationsAdmin';
import ViewReservation from './components/ViewReservation';
import { getUserData } from './services/authService';
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication

import { getReservationData } from './services/reservationService';

function App() {
  const [token, setToken] = useState(null); // Auth token
  const [role, setRole] = useState(''); // User role (Driver, Admin, Manager)
  const [licenseUploaded, setLicenseUploaded] = useState(false); // Driver's license status

  // UI Navigation States
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showReserve, setShowReserve] = useState(false); // Used for viewing vehicles
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAllCarReservations, setShowAllCarReservations] = useState(false);

  //Reservation form
  const [uid, setUid] = useState(null);
  const [reservations, setReservations] = useState([]); 
  const [userReservation, setUserReservation] = useState(null);

  // Fetch role and license status after login
  useEffect(() => {
    // Fetch role and license status after login
    const fetchRole = async () => {
      if (token) {
        const userData = await getUserData(token);
        if (userData.success) {
          setRole(userData.data.role || 'Driver');
          setLicenseUploaded(!!userData.data.licenseImageUrl);

          const fetchAllReservations = async () => {
            try {
              const vehicleSnapshot = await getReservationData(token);
              if (vehicleSnapshot.success) {
                setReservations(vehicleSnapshot.data);
              }
            } catch (error) {
              console.log(error);
            }
          };

          fetchAllReservations();
          // Get the authenticated user's UIDd
          const auth = getAuth();
          const user = auth.currentUser;
          user ? setUid(user.uid) : setUid(null);
        }
      }
    };
    fetchRole();
  }, [token]);

  useEffect(() => {
    // Fetch user reservation only after `reservations` and `uid` have been set
    if (reservations.length > 0 && uid) {
      const userRes = reservations.find(res => res.userId === uid);
      setUserReservation(userRes);
    }
  }, [reservations, uid]);
  
  return (
    <div>
      <h1>Vehicle Management System</h1>
      {!token ? (
        <>
          {/* Register or Login UI */}
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
          canReserve={role === 'Driver'} 
          userReservationReset={setUserReservation}
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
          {/* Show UploadLicense for Drivers who haven't uploaded it */}
          {role === 'Driver' && !licenseUploaded && (
            <UploadLicense token={token} />
          )}
          {/* Show the active reservation, if it exists */}
          {userReservation ? (
            <ViewReservation
              token={token}
              reservationData={userReservation}
              onReservationCleared={() => setUserReservation(null)}  
            />
          ) : (<></>)}
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
              {role === 'Driver' ? 'Reserve Vehicle' : 'View Vehicles'}
            </button>
            {/* Admin and Manager options */}
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
                // Log out user
                setToken(null);
                setRole('');
                setShowProfile(false);
                setShowReserve(false);
                setShowAddVehicle(false);
                setShowAllCarReservations(false);
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
