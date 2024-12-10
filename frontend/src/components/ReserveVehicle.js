import React, { useState, useEffect, useCallback } from "react";
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
import VehicleTable from "./VehicleTable";
import VehicleDetail from "./VehicleDetail";
import MalfunctionMessage from "./MalfunctionMessage";
import ReservationControls from "./ReservationControls";
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
  const [showMessage, setShowMessage] = useState(null);

  const canAddVehicle = role === "Admin";
  const canRepairVehicle = role === "Admin";
  const canDeleteVehicle = role === "Admin";
  const canViewAllReservations = role === "Admin" || role === "Manager";

  // Debugging: Log variables after all dependencies are declared
  useEffect(() => {
    console.log("Reserve Debug - Vehicles:", vehicles);
    console.log("Reserve Debug - Can Repair Vehicle:", canRepairVehicle);
    console.log("Reserve Debug - Handle View Message Function:", handleViewMessage);
  }, [vehicles, canRepairVehicle]);

  const fetchVehicles = useCallback(async () => {
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const userData = await getUserData(token);
      if (userData.success) {
        setRole(userData.data.role || "Driver");
        const auth = getAuth();
        const user = auth.currentUser;
        user ? setUid(user.uid) : setUid(null);

        fetchVehicles();
      }
    };
    fetchData();
  }, [token, fetchVehicles]);

  useEffect(() => {
    if (reservations.length > 0 && uid) {
      const userRes = reservations.find((res) => res.userId === uid);
      setUserReservation(userRes);
    }
  }, [reservations, uid]);

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

  const handleViewMessage = (vehicleId) => {
    setShowMessage(vehicleId);
  };

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
      <VehicleDetail
        viewVehicle={viewVehicle}
        setViewVehicle={setViewVehicle}
        userReservationReset={userReservationReset}
      />
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

  if (showMessage) {
    return (
      <MalfunctionMessage
        vehicleId={showMessage}
        setShowMessage={setShowMessage}
        token={token} // Pass token for API calls
      />
    );
  }

  return (
    <div className="vehicle-container">
      <h2>List of All Vehicles</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error loading vehicles: {error}</p>
      ) : vehicles.length === 0 ? (
        <p>No vehicles found.</p>
      ) : (
        <VehicleTable
          vehicles={vehicles}
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
      )}
      <ReservationControls
        canAddVehicle={canAddVehicle}
        canViewAllReservations={canViewAllReservations}
        setShowReserve={setShowReserve}
        setShowAddVehicle={setShowAddVehicle}
        setShowAllCarReservations={setShowAllCarReservations}
        userReservationReset={userReservationReset}
      />
      {message && <p className="profile-message">{message}</p>}
    </div>
  );
}

export default Reserve;
