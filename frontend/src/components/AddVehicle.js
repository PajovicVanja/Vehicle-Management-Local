import React, { useState } from 'react';
import '../CSS/Profile.css';
import '../CSS/AddVehicle.css';
import { createVehicle } from '../services/vehicleService';

function AddVehicle({ token, setShowAddVehicle }) {
  const [vehicleName, setVehicleName] = useState('');
  const [hp, setHp] = useState('');
  const [engine, setEngine] = useState('');
  const [color, setColor] = useState('');
  const [year, setYear] = useState('');
  const [msg, setMsg] = useState('');

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const vehicle = { vehicleName, engine, hp, color, year };
    const result = await createVehicle(vehicle, token);
    if (result.success) {
      setShowAddVehicle(false);
    } else {
      setMsg(result.error || 'Failed to add vehicle');
    }
  };

  return (
    <div className="add-vehicle-container">
      <h2>Add vehicle</h2>
      <form onSubmit={handleAddVehicle}>
        <input placeholder="Vehicle Name" value={vehicleName} onChange={(e)=>setVehicleName(e.target.value)} className="add-vehicle-input" />
        <input placeholder="Vehicle Color" value={color} onChange={(e)=>setColor(e.target.value)} className="add-vehicle-input" />
        <input placeholder="Vehicle Year" value={year} onChange={(e)=>setYear(e.target.value)} className="add-vehicle-input" />
        <input placeholder="Engine" value={engine} onChange={(e)=>setEngine(e.target.value)} className="add-vehicle-input" />
        <input placeholder="HP" value={hp} onChange={(e)=>setHp(e.target.value)} className="add-vehicle-input" />
        <button type="submit" className="add-vehicle-button">Add vehicle</button>
      </form>
      <button onClick={() => setShowAddVehicle(false)} className="goto-vehicle-select-button">Back to Vehicle selection</button>
      {msg && <p className="error-message">{msg}</p>}
    </div>
  );
}
export default AddVehicle;
