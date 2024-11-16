import React, { useState, useEffect } from 'react';
import '../CSS/Reservations.css';
import { getAdminReservations } from '../services/vehicleService';

function CurrentReservationsAdmin({ token, setShowAllCarReservations }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        console.log('[CurrentReservationsAdmin] Fetching reservations...');
        const result = await getAdminReservations(token);

        console.log('[CurrentReservationsAdmin] Raw API Response:', result);

        if (result?.success && Array.isArray(result.data?.data)) {
          console.log('[CurrentReservationsAdmin] Reservations fetched:', result.data.data);
          setReservations(result.data.data);
        } else {
          console.error('[CurrentReservationsAdmin] Invalid data format:', result);
          throw new Error('Invalid data format in response.');
        }
      } catch (err) {
        console.error('[CurrentReservationsAdmin] Error:', err.message);
        setError('Failed to fetch reservations.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [token]);

  if (loading) {
    return <p>Loading reservations...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  if (!reservations.length) {
    return (
      <div className="reservations-container">
        <h2>Current Car Reservations</h2>
        <p>No reservations found.</p>
        <button
          onClick={() => setShowAllCarReservations(false)}
          className="goto-register-button"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="reservations-container">
      <h2>Current Car Reservations</h2>
      <table className="reservations-table">
        <thead>
          <tr>
            <th>Reservation ID</th>
            <th>Vehicle Name</th>
            <th>Color</th>
            <th>Engine</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>User Email</th>
            <th>License Image</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => {
            const vehicle = reservation.vehicle || {};
            const user = reservation.user || {};

            return (
              <tr key={reservation.reservationId || Math.random()}>
                <td>{reservation.reservationId || 'N/A'}</td>
                <td>{vehicle.vehicleName || 'N/A'}</td>
                <td>{vehicle.color || 'N/A'}</td>
                <td>{vehicle.engine || 'N/A'}</td>
                <td>{reservation.startDate || 'N/A'}</td>
                <td>{reservation.endDate || 'N/A'}</td>
                <td>{user.email || 'N/A'}</td>
                <td>
                  {user.licenseImageUrl ? (
                    <img
                      src={user.licenseImageUrl}
                      alt="License"
                      className="license-thumbnail"
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button
        onClick={() => setShowAllCarReservations(false)}
        className="goto-register-button"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default CurrentReservationsAdmin;
