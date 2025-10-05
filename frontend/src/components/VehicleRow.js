// frontend/src/components/VehicleRow.js
import React from "react";

const VehicleRow = ({
  vehicle,
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
  const status = vehicle.status;

  // Debugging
  console.log("VehicleRow Debug - Vehicle:", vehicle);
  console.log("VehicleRow Debug - Status:", status);
  console.log("VehicleRow Debug - Can Repair Vehicle:", canRepairVehicle);

  return (
    <tr className={status}>
      <td>{vehicle.vehicleName}</td>
      <td>{vehicle.color || "—"}</td>
      <td>{vehicle.year || "—"}</td>
      <td>
        {vehicle.engine} {vehicle.hp ? `- ${vehicle.hp} HP` : ""}
      </td>
      <td>
        <div className="vehicle-actions">
          <button onClick={() => handleView(vehicle)} className="view-button">
            View
          </button>

          {status === "available" && !userReservation && (
            <button
              onClick={() => handleReserve(vehicle.vehicleId)}
              className="reserve-button"
            >
              Reserve
            </button>
          )}

          {status !== "available" && userReservation?.vehicleId === vehicle.vehicleId && (
            <>
              <button onClick={() => removeReserve(vehicle)} className="reserve-button">
                Remove Reserve
              </button>
              <button
                onClick={() => setReportIssueVehicleId(vehicle.vehicleId)}
                className="reserve-button"
              >
                Report Issue
              </button>
            </>
          )}

          {canRepairVehicle && status === "repair" && (
            <>
              <button onClick={() => handleRepair(vehicle.vehicleId)} className="reserve-button">
                Repair
              </button>
              <button onClick={() => handleViewMessage(vehicle.vehicleId)} className="reserve-button">
                View Message
              </button>
            </>
          )}

          {canDeleteVehicle && (
            <button onClick={() => handleDelete(vehicle.vehicleId)} className="reserve-button">
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default VehicleRow;
