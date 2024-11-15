// components/AddVehicle.js
import React, { useState, useEffect } from 'react';
import '../CSS/Profile.css';
import '../CSS/AddVehicle.css';
import { db, collection, doc, setDoc  } from '../firebaseClient'; // Import Firestore

function AddVehicle({ token, setShowAddVehicle }) {
  const [vehicleName, setVehicleName] = useState('');
  const [hp, setHp] = useState('');
  const [engine, setEngine] = useState('');
  const [color, setColor] = useState('');
  const [year, setYear] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    
      // Generate a unique document reference with a new ID
      const vehicleRef = doc(collection(db, 'vehicles'));
      const vehicleId = vehicleRef.id;
      const status = 'available';

      // Create a new vehicle object including the vehicleId
      const newVehicle = {
        vehicleId,           // Add the unique ID to the vehicle data
        vehicleName,
        engine,
        hp,
        color,
        year,
        image,
        status,
      };

    try {

      // Add the document with the custom ID and data
      await setDoc(vehicleRef, newVehicle);
      console.log(`Added vehicle ${newVehicle.vehicleName} with ID: ${vehicleId}`);

    } catch (error) {
        console.error("Error adding vehicle:", error);
    }

    setShowAddVehicle(false);
  }

  return (
    <div className="add-vehicle-container">
      <h2>Add vehicle</h2>
      <form onSubmit={handleAddVehicle}>
        <input
          type="vehicleName"
          placeholder="Vehicle Name"
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
          className="add-vehicle-input"
        />
        <input
          type="vehicleColor"
          placeholder="Vehicle Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="add-vehicle-input"
        />
        <input
          type="year"
          placeholder="Vehicle Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="add-vehicle-input"
        />
        <input
          type="engine"
          placeholder="Engine"
          value={engine}
          onChange={(e) => setEngine(e.target.value)}
          className="add-vehicle-input"
        />
        <input
          type="hp"
          placeholder="HP"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="add-vehicle-input"
        />
        <button type="submit" className="add-vehicle-button">Add vehicle</button>
      </form>
      <button onClick={() => setShowAddVehicle(false)} className='goto-vehicle-select-button'>Back to Vehicle selection</button>
      {error && <p  className="error-message">{error}</p>}
    </div>
  );
}

export default AddVehicle;
