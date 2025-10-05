import React from "react";

const ReservationControls = ({
  canAddVehicle,
  canViewAllReservations,      // kept for compatibility (not used)
  setShowReserve,
  setShowAddVehicle,
  setShowAllCarReservations,   // kept for compatibility (not used)
  userReservationReset
}) => {
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
        <button
          onClick={() => setShowAddVehicle(true)}
          className="back-button"
        >
          Add Vehicle
        </button>
      )}

    </div>
  );
};

export default ReservationControls;
