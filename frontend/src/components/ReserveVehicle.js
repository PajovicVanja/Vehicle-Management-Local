// components/ReserveVehicle.js
import React, { useState, useEffect } from 'react';
import '../App.css';
import '../CSS/Profile.css';
import '../CSS/ReserveVehicle.css';
import { getUserData } from '../services/authService';
import { getVehicleData } from '../services/vehicleService';

function Reserve({ token, setShowReserve, setShowAddVehicle }) {
  const [message, setMessage] = useState('');
  const [admin, setAdmin] = useState(false);
  const [vehicles, setVehicles] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getUserData(token);
      if (result.success) {
        setAdmin(result.data.admin);
      } else {
        setMessage(result.error || 'Failed to load profile data');
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try{
        const vehicleSnapshot = await getVehicleData(token);
        console.log(vehicleSnapshot.data);
        if (vehicleSnapshot.success) {
          setVehicles(vehicleSnapshot.data);
        } else {
          setMessage(vehicleSnapshot.error || 'Failed to load vehicle data');
        }
      }catch(error){
        console.log(error);
        setError(error);
      }finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleReserve = (vehicleName) => {
      alert(`Vehicle reserved: ${vehicleName}`);
      // !! TODO: implement reservation logic
  };

  return (
    <div className="profile-container">
      <h2>List of all vehicles: </h2>
      <p className="profile-email">
        <div>
            <h2>Vehicle List</h2>
            {vehicles && vehicles.length > 0 ? (
              <table className="vehicle-table">
                <thead>
                    <tr>
                        <th>Vehicle Name</th>
                        <th>Horsepower (HP)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicles.map((vehicle, index) => (
                        <tr key={index}>
                            <td>{vehicle.vehicleName}</td>
                            <td>{vehicle.hp}</td>
                            <td>
                                <button onClick={() => handleReserve(vehicle.vehicleName)} className="reserve-button">
                                    Reserve
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
              </table>) 
            : loading ? (<p>Loading...</p>) 
            : error ? (<p>Error loading vehicles: {error.message}</p>) : (<p>No vehicles found.</p>)}
        </div>
      </p>
      <div className="button-group">
        <button onClick={() => setShowReserve(false)} className='goto-register-button'>Back to Dashboard</button>
        {!admin ? //remove the ! once admin functionality is added to Users
        <button onClick={() => setShowAddVehicle(true)} className='goto-register-button'>Add vehicle</button> 
        : <></>
        }
      </div>
      {message && <p className="profile-message">{message}</p>}
    </div>
  );
}

export default Reserve;
