import React from "react";

const ReservationControls = ({ canAddVehicle, canViewAllReservations, setShowReserve, setShowAddVehicle, setShowAllCarReservations, userReservationReset }) => {
  return (
    <div className="button-group">
      <button
        onClick={() => {
          setShowReserve(false);
          userReservationReset(null);
        }}
        className="back-button"
      >
        Back to Dashboard
      </button>
      {canAddVehicle && (
        <button onClick={() => setShowAddVehicle(true)} className="add-button">
          Add Vehicle
        </button>
      )}
      {canViewAllReservations && (
        <button
          onClick={() => setShowAllCarReservations(true)}
          className="view-reservations-button"
        >
          View All Reservations
        </button>
      )}
    </div>
  );
};

export default ReservationControls;