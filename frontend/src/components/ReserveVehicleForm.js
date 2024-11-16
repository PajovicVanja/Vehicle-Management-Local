// ReserveVehicleForm.js

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../App.css';
import '../CSS/Profile.css';
import '../CSS/ReserveVehicle.css';
import '../CSS/AddVehicle.css';
import { reserveVehicle } from '../services/vehicleService';
import { db, collection, doc, setDoc } from '../firebaseClient'; // Import Firestore
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication

function ReserveVehicleForm({ token, reserveVehicleId, setReserveVehicleId, fetchVehicles }) {
  const [endDate, setEndDate] = useState(new Date());
  const startDate = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format
  const status = 'Active';
  const [message, setMessage] = useState('');

  const handleReservationSubmit = async (e) => {
    e.preventDefault();

    console.log('[ReserveVehicleForm] Start Date:', startDate);
    console.log('[ReserveVehicleForm] End Date:', endDate);

    // Get the authenticated user's UID
    const auth = getAuth();
    const user = auth.currentUser;
    const uid = user ? user.uid : null;

    if (!uid) {
      console.error('[ReserveVehicleForm] User not authenticated.');
      setMessage('Please log in to make a reservation.');
      return;
    }

    if (!endDate) {
      console.error('[ReserveVehicleForm] End date is missing.');
      setMessage('Please select an end date.');
      return;
    }

    // Generate a unique document reference with a new ID
    const reservationRef = doc(collection(db, 'reservation'));
    const reservationId = reservationRef.id;

    const newReservation = {
      reservationId,
      vehicleId: reserveVehicleId,
      userId: uid, // Use the authenticated user's UID
      startDate: startDate,
      endDate: endDate.toISOString().split('T')[0],
      status: status,
    };

    console.log('[ReserveVehicleForm] New reservation data:', newReservation);

    try {
      // Add the document with the custom ID and data
      await setDoc(reservationRef, newReservation);
      console.log(`[ReserveVehicleForm] Added reservation with ID: ${reservationId}`);
      setReserveVehicleId(null);

      // Call backend to update vehicle status
      const result = await reserveVehicle(reserveVehicleId, {
        startDate,
        endDate: endDate.toISOString().split('T')[0],
      }, token);

      console.log('[ReserveVehicleForm] Reserve vehicle response:', result);

      if (result.success) {
        console.log(`[ReserveVehicleForm] Vehicle ${reserveVehicleId} status updated.`);
        fetchVehicles(); // Refresh the list of vehicles
      } else {
        console.error(`[ReserveVehicleForm] Failed to update vehicle status for ID: ${reserveVehicleId}`);
        setMessage('Failed to reserve vehicle. Please try again.');
      }
    } catch (error) {
      console.error('[ReserveVehicleForm] Error adding reservation:', error);
      setMessage('An error occurred while reserving the vehicle.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <h2>Reserve Vehicle</h2>
      <form onSubmit={handleReservationSubmit}>
        <label>Start Date: {startDate}</label>
        <br />
        <label htmlFor="endDate">Select End Date:</label>
        <Calendar
          onChange={setEndDate}
          value={endDate}
          minDate={new Date()} // Prevent selection of past dates
        />
        <br />
        <button type="submit" className="add-vehicle-button">Reserve</button>
      </form>
      <button onClick={() => setReserveVehicleId(null)} className="goto-vehicle-select-button">
        Back to Vehicle selection
      </button>
      {message && <p className="profile-message">{message}</p>}
    </div>
  );
}

export default ReserveVehicleForm;
