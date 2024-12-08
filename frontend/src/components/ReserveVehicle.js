import React, { useState, useEffect } from "react";
import { getUserData } from "../services/authService";
import {
  getVehicleData,
  deleteVehicle,
  repairVehicle,
  unreserveVehicle,
} from "../services/vehicleService";
import { getReservationData, deleteReservation } from "../services/reservationService";
import ReserveVehicleForm from "./ReserveVehicleForm";
import ReportIssueForm from "./ReportIssueForm";
import { getAuth } from "firebase/auth";

function Reserve({
  token,
  setShowReserve,
  setShowAddVehicle,
  setShowAllCarReservations,
  userReservationReset,
}) {
  const [message, setMessage] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [reserveVehicleId, setReserveVehicleId] = useState(null);
  const [role, setRole] = useState("");
  const [uid, setUid] = useState(null);
  const [userReservation, setUserReservation] = useState(null);
  const [reportIssueVehicleId, setReportIssueVehicleId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const userData = await getUserData(token);
      if (userData.success) {
        setRole(userData.data.role || "Driver");
        const auth = getAuth();
        const user = auth.currentUser;
        user ? setUid(user.uid) : setUid(null);
        await fetchVehicles();
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (reservations.length > 0 && uid) {
      const userRes = reservations.find((res) => res.userId === uid);
      setUserReservation(userRes);
    }
  }, [reservations, uid]);

  const canAddVehicle = role === "Admin";
  const canRepairVehicle = role === "Admin";
  const canDeleteVehicle = role === "Admin";
  const canViewAllReservations = role === "Admin" || role === "Manager";

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const vehicleSnapshot = await getVehicleData(token);
      const reservationSnapshot = await getReservationData(token);

      if (vehicleSnapshot.success) {
        setVehicles(vehicleSnapshot.data);
      } else {
        setMessage(vehicleSnapshot.error || "Failed to load vehicle data");
      }

      if (reservationSnapshot.success) {
        setReservations(reservationSnapshot.data);
      } else {
        setMessage(reservationSnapshot.error || "Failed to load reservations.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = (vehicleId) => {
    setReserveVehicleId(vehicleId);
  };

  const removeReserve = async (vehicle) => {
    try {
      const result = await unreserveVehicle(vehicle.vehicleId, token);
      if (result.success) {
        const reservation = reservations.find(
          (res) => res.vehicleId === vehicle.vehicleId && res.userId === uid
        );
        if (reservation) {
          const deleteResult = await deleteReservation(reservation.reservationId, token);
          if (deleteResult.success) {
            setUserReservation(null);
            await fetchVehicles();
          } else {
            console.error("Failed to delete reservation:", deleteResult.error);
          }
        }
      } else {
        console.error("Failed to unreserve vehicle:", result.error);
      }
    } catch (error) {
      console.error("Error removing reservation:", error);
    }
  };

  const handleView = (vehicle) => {
    setViewVehicle(vehicle);
  };

  const handleRepair = async (vehicleId) => {
    const result = await repairVehicle(vehicleId, token);
    if (result.success) {
      await fetchVehicles();
    }
  };

  const handleDelete = async (vehicleId) => {
    const result = await deleteVehicle(vehicleId, token);
    if (result.success) {
      await fetchVehicles();
    }
  };

  const vehicleTableRow = (vehicle, status) => (
    <tr key={vehicle.vehicleId} className={status}>
      <td>{vehicle.vehicleName}</td>
      <td>
        {vehicle.engine} - {vehicle.hp} HP
      </td>
      <td>
        <div className="vehicle-actions">
          <button onClick={() => handleView(vehicle)} className="view-button">
            View
          </button>
          {status === "available" && !userReservation && (
            <button onClick={() => handleReserve(vehicle.vehicleId)} className="reserve-button">
              Reserve
            </button>
          )}
          {status !== "available" && userReservation?.vehicleId === vehicle.vehicleId && (
            <>
              <button onClick={() => removeReserve(vehicle)} className="reserve-button">
                Remove Reserve
              </button>
              <button onClick={() => setReportIssueVehicleId(vehicle.vehicleId)} className="report-button">
                Report Issue
              </button>
            </>
          )}
          {canRepairVehicle && status === "repair" && (
            <button onClick={() => handleRepair(vehicle.vehicleId)} className="repair-button">
              Repair
            </button>
          )}
          {canDeleteVehicle && (
            <button onClick={() => handleDelete(vehicle.vehicleId)} className="delete-button">
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  if (reserveVehicleId) {
    return (
      <ReserveVehicleForm
        token={token}
        reserveVehicleId={reserveVehicleId}
        setReserveVehicleId={setReserveVehicleId}
        fetchVehicles={fetchVehicles}
      />
    );
  }

  if (viewVehicle) {
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
  }

  if (reportIssueVehicleId) {
    return (
      <ReportIssueForm
        vehicleId={reportIssueVehicleId}
        setShowReportIssue={() => setReportIssueVehicleId(null)}
        fetchVehicles={fetchVehicles}
      />
    );
  }

  return (
    <div className="vehicle-container">
      <h2>List of All Vehicles</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error loading vehicles: {error.message}</p>
      ) : vehicles.length === 0 ? (
        <p>No vehicles found.</p>
      ) : (
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Vehicle Name</th>
              <th>Engine</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => vehicleTableRow(vehicle, vehicle.status))}
          </tbody>
        </table>
      )}
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
      {message && <p className="profile-message">{message}</p>}
    </div>
  );
}

export default Reserve;
