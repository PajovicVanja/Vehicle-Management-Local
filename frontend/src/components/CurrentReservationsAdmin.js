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
        const result = await getAdminReservations(token);
        if (result.success) {
          setReservations(result.data);
        } else {
          setError(result.message || 'Failed to fetch reservations.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching reservations.');
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
          {reservations.length > 0 ? (
            reservations.map((reservation) => (
              <tr key={reservation.reservationId}>
                <td>{reservation.reservationId}</td>
                <td>{reservation.vehicle?.vehicleName || 'N/A'}</td>
                <td>{reservation.vehicle?.color || 'N/A'}</td>
                <td>{reservation.vehicle?.engine || 'N/A'}</td>
                <td>{reservation.startDate || 'N/A'}</td>
                <td>{reservation.endDate || 'N/A'}</td>
                <td>{reservation.user?.email || 'N/A'}</td>
                <td>
                  {reservation.user?.licenseImageUrl ? (
                    <img
                      src={reservation.user.licenseImageUrl}
                      alt="Driver's License"
                      className="license-thumbnail"
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No reservations found.</td>
            </tr>
          )}
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
