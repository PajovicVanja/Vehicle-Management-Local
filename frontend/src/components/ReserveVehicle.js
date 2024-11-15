// components/ReserveVehicle.js
import React, { useState, useEffect } from 'react';
import '../App.css';
import '../CSS/Profile.css';
import '../CSS/ReserveVehicle.css';
import { getUserData } from '../services/authService';
import { getVehicleData, deleteVehicle, reserveVehicle, repairVehicle } from '../services/vehicleService';

function Reserve({ token, setShowReserve, setShowAddVehicle }) {
  const [message, setMessage] = useState('');
  const [admin, setAdmin] = useState(false);
  const [vehicles, setVehicles] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewVehicle,setViewVehicle] = useState(null);

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

  const fetchData = async () => {
    setLoading(true); // Start loading
    try {
      const vehicleSnapshot = await getVehicleData(token);
      console.log(vehicleSnapshot.data);
      if (vehicleSnapshot.success) {
        setVehicles(vehicleSnapshot.data);
      } else {
        setMessage(vehicleSnapshot.error || 'Failed to load vehicle data');
      }
    } catch (error) {
      console.log(error);
      setError(error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  async function handleReserve(vehicleId) {
    const result = await reserveVehicle(vehicleId, token);
    if (result.success) {
      console.log(`Vehicle ${vehicleId} status updated.`);
      // refresh the list of vehicles here
      fetchData();
    } else {
      console.error(`Failed to update vehicle status for ID: ${vehicleId}`);
    }
  }

  const handleView = (vehicle) => {
    setViewVehicle(vehicle);
  };

  async function handleRepair(vehicleId) {
    const result = await repairVehicle(vehicleId, token);
    if (result.success) {
      console.log(`Vehicle ${vehicleId} status updated.`);
      // refresh the list of vehicles here
      fetchData();
    } else {
      console.error(`Failed to update vehicle status for ID: ${vehicleId}`);
    }
  }

  async function handleDelete(vehicleId) {
    const result = await deleteVehicle(vehicleId, token);
    if (result.success) {
      console.log(`Vehicle ${vehicleId} deleted successfully.`);
      // refresh the list of vehicles here
      fetchData();
    } else {
      console.error('Error deleting vehicle:', result.error);
    }
  }

  // View a single vehicle
  if(viewVehicle!=null) return(
    <div className="vehicle-detail">
      <h2>{viewVehicle.vehicleName} Details</h2>
      <img src={viewVehicle.image} alt={viewVehicle.vehicleName} />
      <table className="vehicle-table">
        <tbody>
          <tr>
            <td><strong>Vehicle Name:</strong></td>
            <td>{viewVehicle.vehicleName}</td>
          </tr>
          <tr>
            <td><strong>Engine:</strong></td>
            <td>{viewVehicle.engine}</td>
          </tr>
          <tr>
            <td><strong>Horsepower:</strong></td>
            <td>{viewVehicle.hp} HP</td>
          </tr>
          <tr>
            <td><strong>Color:</strong></td>
            <td>{viewVehicle.color}</td>
          </tr>
          <tr>
            <td><strong>Year:</strong></td>
            <td>{viewVehicle.year}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td>{viewVehicle.status}</td>
          </tr>
        </tbody>
      </table>
      <button onClick={() => setViewVehicle(null)} className='goto-register-button'>Back to vehicle list</button>
    </div>
  )

  //View a list of vehicles to reserve (or if admin, all vehicles that exist)
  return (
    <div className="vehicle-container">
      <h2>List of all vehicles</h2>
      <p className="profile-email">
        <div>
          {vehicles && vehicles.length > 0 ? (
            <table className="vehicle-table">
              <thead>
                  <tr>
                      <th>Vehicle Name</th>
                      <th>Engine</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {vehicles.map((vehicle, index) => (
                    (vehicle.status === 'available' || !admin) ? (
                      <tr key={vehicle.vehicleId}>
                          <td>{vehicle.vehicleName}</td>
                          <td>{vehicle.engine} - {vehicle.hp} HP</td>
                          <td>
                            <div className="vehicle-actions">
                              <button onClick={() => handleView(vehicle)} className="view-button">
                                  View
                              </button>
                              <button onClick={() => handleReserve(vehicle.vehicleId)} className="reserve-button">
                                  Reserve
                              </button>
                              {!admin ? ( // !! TODO: change once admin functionality is implemented to the User
                                <button onClick={() => handleRepair(vehicle.vehicleId)} className="view-button">
                                    Repair
                                </button>) 
                              : (<></>)}
                              {!admin ? ( // !! TODO: change once admin functionality is implemented to the User
                                <button onClick={() => handleDelete(vehicle.vehicleId)} className="reserve-button">
                                    Delete
                                </button>) 
                              : (<></>)}
                            </div>
                          </td>
                      </tr>
                    ): (<></>)
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
