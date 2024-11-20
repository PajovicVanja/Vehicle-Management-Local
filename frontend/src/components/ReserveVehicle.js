// components/ReserveVehicle.js
import React, { useState, useEffect } from 'react';
import { getUserData } from '../services/authService';
import { getVehicleData, deleteVehicle, repairVehicle, unreserveVehicle } from '../services/vehicleService';
import { getReservation, getReservationData, deleteReservation } from '../services/reservationService';
import ReserveVehicleForm from '../components/ReserveVehicleForm';
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication

function Reserve({ token, setShowReserve, setShowAddVehicle, setShowAllCarReservations, userReservationReset }) {
  const [message, setMessage] = useState('');
  const [vehicles, setVehicles] = useState([]); 
  const [reservations, setReservations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewVehicle,setViewVehicle] = useState(null);
  const [reserveVehicleId,setReserveVehicleId] = useState(null);
  const [role, setRole] = useState('');
  const [uid, setUid] = useState(null);
  const [userReservation, setUserReservation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      const userData = await getUserData(token);
      
      if (userData.success) {
        setRole(userData.data.role || 'Driver');

        // Get the authenticated user's UID
        const auth = getAuth();
        const user = auth.currentUser;
        user ? setUid(user.uid) : setUid(null);
        await fetchVehicles();
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    // Fetch user reservation only after `reservations` and `uid` have been set
    if (reservations.length > 0 && uid) {
      const userRes = reservations.find(res => res.userId === uid);
      setUserReservation(userRes);
    }
  }, [reservations, uid]);

  const canAddVehicle = role === 'Admin';
  const canRepairVehicle = role === 'Admin';
  const canDeleteVehicle = role === 'Admin';
  const canViewAllRepairs = role === 'Admin';
  const canViewAllReservations = role === 'Admin' || role === 'Manager';

  const fetchVehicles = async () => {
    setLoading(true); // Start loading
    try {
      const vehicleSnapshot = await getVehicleData(token);
      if (vehicleSnapshot.success) {
        await fetchAllReservations();
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
  
  const fetchAllReservations = async () => {
    setLoading(true); // Start loading
    try {
      const vehicleSnapshot = await getReservationData(token);
      if (vehicleSnapshot.success) {
        setReservations(vehicleSnapshot.data);
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
  
  const fetchReservation = async (resId) => {
    try {
      const resSnapshot = await getReservation(resId, token);
      if (resSnapshot.success) {
        return(resSnapshot.data);
      } else {
        setMessage(resSnapshot.error || 'Failed to load reservation data.');
      }
    } catch (error) {
      console.log(error);
      setError(error);
    }
  };

  const handleReserve = (vehicleId) => {
    setReserveVehicleId(vehicleId);
  };

  async function removeReserve(vehicle){
    var result = await unreserveVehicle(vehicle.vehicleId, token);
    if (result.success) {
      console.log(`Vehicle ${vehicle.vehicleId} status now available.`);
      const reservation = reservations.find(res => res.reservationId === vehicle.status);
      console.log('Found reservation: ', reservation.reservationId);
      result = await deleteReservation(reservation.reservationId, token);
      if (result.success) {
        console.log(`Removed ${reservation.reservationId} reservation.`);

        // refresh the list of vehicles here
        fetchVehicles();
      } else {
        console.error(`Failed to remove reservation: ${reservation.reservationId}`);
      }

      // refresh the list of vehicles here
      fetchVehicles();
    } else {
      console.error(`Failed to update vehicle status for ID: ${vehicle.vehicleId}`);
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

  function vehicleTableRow(vehicle, status){
    return(
      <tr key={vehicle.vehicleId} className={status}>
        <td>{vehicle.vehicleName}</td>
        <td>{vehicle.engine} - {vehicle.hp} HP</td>
        <td>
          <div className="vehicle-actions">
            <button onClick={() => handleView(vehicle)} className="view-button">
              View
            </button>
            {(status != 'reserved' && userReservation == null) ? (
              <button onClick={() => handleReserve(vehicle.vehicleId)} className="reserve-button">
                Reserve
              </button>) 
            : (<></>)}
            {(status === 'reserved') ? (
              <button onClick={() => removeReserve(vehicle)} className="reserve-button">
                Remove Reserve
              </button>) 
            : (<></>)}
            {(canRepairVehicle && status != 'reserved') ? (
              <button onClick={() => handleRepair(vehicle.vehicleId)} className="view-button">
                Repair
              </button>) 
            : (<></>)}
            {canDeleteVehicle ? (
              <button onClick={() => handleDelete(vehicle.vehicleId)} className="reserve-button">
                Delete
              </button>) 
            : (<></>)}
          </div>
        </td>
      </tr>
    )
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
            <td>{(viewVehicle.status != 'available' && viewVehicle.status != 'repair') ?
            ('reserved by: ' + viewVehicle.status) : viewVehicle.status
            }</td>
          </tr>
        </tbody>
      </table>
      <button onClick={() => {
        setViewVehicle(null);
        userReservationReset(null);
        }} className='goto-register-button'>Back to vehicle list</button>
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
                    (vehicle.status === 'available') ? vehicleTableRow(vehicle, 'available') : (<></>)
                  ))}
                  {vehicles.map((vehicle, index) => (
                    (vehicle.status === 'repair' && canViewAllRepairs) ? vehicleTableRow(vehicle, 'repair') : (<></>)
                  ))}
                  {vehicles.map((vehicle, index) => {
                    if(vehicle.status != 'repair' && vehicle.status != 'available'){
                      if(canViewAllReservations) return vehicleTableRow(vehicle, 'reserved');

                      // Check reservation data fetched previously
                      if (userReservation && userReservation.reservationId === vehicle.status) {
                        return vehicleTableRow(vehicle, 'reserved');
                      }
                    }
                    return null;
                  }
                  )}
              </tbody>
            </table>) 
          : loading ? (<p>Loading...</p>) 
          : error ? (<p>Error loading vehicles: {error.message}</p>) : (<p>No vehicles found.</p>)}
        </div>
      </p>
      <div className="button-group">
        <button onClick={() => {
          setShowReserve(false);
          userReservationReset(null);
        }} className='goto-register-button'>Back to Dashboard</button>
        {canAddVehicle && (
        <button onClick={() => setShowAddVehicle(true)} className="goto-register-button">
          Add Vehicle
        </button>
        )}
        {canViewAllReservations && (
        <button
            onClick={() => {
              setShowReserve(false);
              setShowAllCarReservations(true);
            }}
            className="goto-register-button"
        >
          View All Reservations
        </button>
        )}
      </div>
      {message && <p className="profile-message">{message}</p>}
    </div>
  );
}

export default Reserve;
