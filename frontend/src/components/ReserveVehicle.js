// components/ReserveVehicle.js
import React, { useState, useEffect } from 'react';
import { getUserData } from '../services/authService';
import { getVehicleData, deleteVehicle, repairVehicle } from '../services/vehicleService';
import ReserveVehicleForm from '../components/ReserveVehicleForm';

function Reserve({ token, setShowReserve, setShowAddVehicle }) {
  const [message, setMessage] = useState('');
  const [admin, setAdmin] = useState(false);
  const [vehicles, setVehicles] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewVehicle,setViewVehicle] = useState(null);
  const [reserveVehicleId,setReserveVehicleId] = useState(null);
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

  const fetchVehicles = async () => {
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
    fetchVehicles();
  }, [token]);

  const handleReserve = (vehicleId) => {
    setReserveVehicleId(vehicleId);
  };

  const handleView = (vehicle) => {
    setViewVehicle(vehicle);
  };

  async function handleRepair(vehicleId) {
    const result = await repairVehicle(vehicleId, token);
    if (result.success) {
      console.log(`Vehicle ${vehicleId} status updated.`);
      // refresh the list of vehicles here
      fetchVehicles();
    } else {
      console.error(`Failed to update vehicle status for ID: ${vehicleId}`);
    }
  }

  async function handleDelete(vehicleId) {
    const result = await deleteVehicle(vehicleId, token);
    if (result.success) {
      console.log(`Vehicle ${vehicleId} deleted successfully.`);
      // refresh the list of vehicles here
      fetchVehicles();
    } else {
      console.error('Error deleting vehicle:', result.error);
    }
  }

  // Reserve a vehicle, form
  if (reserveVehicleId != null) return (
    <ReserveVehicleForm 
      token={token} 
      reserveVehicleId={reserveVehicleId} 
      setReserveVehicleId={setReserveVehicleId} 
      fetchVehicles={fetchVehicles}
    />
  );

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
