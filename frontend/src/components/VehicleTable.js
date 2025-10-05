// frontend/src/components/VehicleTable.js
import React from "react";
import VehicleRow from "./VehicleRow";

const VehicleTable = ({
  vehicles,
  userReservation,
  canRepairVehicle,
  canDeleteVehicle,
  handleView,
  handleReserve,
  removeReserve,
  setReportIssueVehicleId,
  handleRepair,
  handleDelete,
  handleViewMessage,
}) => {
  // Debugging
  console.log("VehicleTable Debug - Vehicles:", vehicles);
  console.log("VehicleTable Debug - Handle View Message Function:", handleViewMessage);

  return (
    <table className="vehicle-table">
      <thead>
        <tr>
          <th>Vehicle Name</th>
          <th>Color</th>
          <th>Year</th>
          <th>Engine / HP</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map((vehicle) => (
          <VehicleRow
            key={vehicle.vehicleId}
            vehicle={vehicle}
            userReservation={userReservation}
            canRepairVehicle={canRepairVehicle}
            canDeleteVehicle={canDeleteVehicle}
            handleView={handleView}
            handleReserve={handleReserve}
            removeReserve={removeReserve}
            setReportIssueVehicleId={setReportIssueVehicleId}
            handleRepair={handleRepair}
            handleDelete={handleDelete}
            handleViewMessage={handleViewMessage}
          />
        ))}
      </tbody>
    </table>
  );
};

export default VehicleTable;
