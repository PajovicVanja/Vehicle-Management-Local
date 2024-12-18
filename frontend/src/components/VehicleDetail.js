import React from "react";

const VehicleDetail = ({ viewVehicle, setViewVehicle, userReservationReset }) => {
  return (
    <div className="vehicle-detail">
      <h2>{viewVehicle.vehicleName} Details</h2>
      <img src={viewVehicle.image} alt={viewVehicle.vehicleName} />
      <table className="vehicle-table">
        <tbody>
          <tr>
            <td>Vehicle Name:</td>
            <td>{viewVehicle.vehicleName}</td>
          </tr>
          <tr>
            <td>Engine:</td>
            <td>{viewVehicle.engine}</td>
          </tr>
          <tr>
            <td>Horsepower:</td>
            <td>{viewVehicle.hp} HP</td>
          </tr>
          <tr>
            <td>Color:</td>
            <td>{viewVehicle.color}</td>
          </tr>
          <tr>
            <td>Year:</td>
            <td>{viewVehicle.year}</td>
          </tr>
          <tr>
            <td>Status:</td>
            <td>{viewVehicle.status}</td>
          </tr>
        </tbody>
      </table>
      <button
        onClick={() => {
          setViewVehicle(null);
          userReservationReset(null);
        }}
        className="goto-register-button"
      >
        Back to vehicle list
      </button>
    </div>
  );
};

export default VehicleDetail;