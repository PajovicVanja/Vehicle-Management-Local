// components/ReserveVehicle.js
import React, { useState, useEffect } from 'react';
import { getUserData } from '../services/authService';

function ReserveVehicle({ token, setShowReserve, setShowAddVehicle }) {
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUserData(token);
      if (userData.success) {
        setRole(userData.data.role || 'Driver');
      }
    };
    fetchData();
  }, [token]);

  const canAddVehicle = role === 'Admin';
  const canViewAllReservations = role === 'Admin' || role === 'Manager';

  return (
    <div>
      <h2>Reserve Vehicle</h2>
      {canAddVehicle && (
        <button onClick={() => setShowAddVehicle(true)} className="reserve-button">
          Add Vehicle
        </button>
      )}
      {canViewAllReservations && (
        <button
          onClick={() => setShowReserve(false)}
          className="view-reservations-button"
        >
          View All Reservations
        </button>
      )}
    </div>
  );
}

export default ReserveVehicle;
