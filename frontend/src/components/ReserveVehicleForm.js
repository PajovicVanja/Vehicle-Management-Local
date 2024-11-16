import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../App.css';
import '../CSS/Profile.css';
import '../CSS/ReserveVehicle.css';
import '../CSS/AddVehicle.css';
import { reserveVehicle } from '../services/vehicleService';

import { db, collection, doc, setDoc  } from '../firebaseClient'; // Import Firestore

function ReserveVehicleForm({ token, reserveVehicleId, setReserveVehicleId, fetchVehicles }) {
  const [endDate, setEndDate] = useState(new Date());
  const startDate = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format
  const status = 'Active';

  const handleReservationSubmit = async (e) => {
    e.preventDefault();

    // Generate a unique document reference with a new ID
    const reservationRef = doc(collection(db, 'reservation'));
    const reservationId = reservationRef.id;
    
    const newReservation = {
      reservationId,
      vehicleId: reserveVehicleId,
      userId: token,
      startDate: startDate,
      endDate: endDate.toISOString().split('T')[0],
      status: status,
    };

    try {
        // Add the document with the custom ID and data
        await setDoc(reservationRef, newReservation);
        console.log(`Added reservation ${newReservation.vehicleName} with ID: ${reservationId}`);
        setReserveVehicleId(null);
        const result = await reserveVehicle(reserveVehicleId, reservationId);
        if (result.success) {
            console.log(`Vehicle ${reserveVehicleId} status updated.`);
            // refresh the list of vehicles here
            fetchVehicles();
        } else {
            console.error(`Failed to update vehicle status for ID: ${reserveVehicleId}`);
        }
  
    } catch (error) {
        console.error("Error adding reservation:", error);
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
      <button onClick={() => setReserveVehicleId(null)} className='goto-vehicle-select-button'>Back to Vehicle selection</button>
    </div>
  );
}

export default ReserveVehicleForm;
