import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getUserData } from "../services/authService";
import {
  getVehicleData,
  deleteVehicle,
  repairVehicle,
  unreserveVehicle,
} from "../services/vehicleService";
import {
  getReservationData,
  deleteReservation,
} from "../services/reservationService";
import ReserveVehicleForm from "./ReserveVehicleForm";
import ReportIssueForm from "./ReportIssueForm";
import VehicleTable from "./VehicleTable";
import VehicleDetail from "./VehicleDetail";
import MalfunctionMessage from "./MalfunctionMessage";
import ReservationControls from "./ReservationControls";
import VehicleSearch from "./VehicleSearch";
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

  // Search filters
  const [filters, setFilters] = useState({
    name: "",
    color: "",
    engine: "",
    yearMin: "",
    yearMax: "",
    hpMin: "",
    hpMax: "",
  });

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
        await fetchVehicles();
      } else {
        setMessage(userData.error || "Failed to load profile");
        setLoading(false);
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

  // --- Search logic (case-insensitive contains for text; numeric ranges for year & hp)
  const filteredVehicles = useMemo(() => {
    const norm = (v) => (v ?? "").toString().toLowerCase();
    const num = (v) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : null;
    };

    const f = {
      name: norm(filters.name),
      color: norm(filters.color),
      engine: norm(filters.engine),
      yearMin: num(filters.yearMin),
      yearMax: num(filters.yearMax),
      hpMin: num(filters.hpMin),
      hpMax: num(filters.hpMax),
    };

    return vehicles.filter((veh) => {
      const name = norm(veh.vehicleName);
      const color = norm(veh.color);
      const engine = norm(veh.engine);
      const year = num(veh.year);
      const hp = num(veh.hp);

      if (f.name && !name.includes(f.name)) return false;
      if (f.color && !color.includes(f.color)) return false;
      if (f.engine && !engine.includes(f.engine)) return false;

      if (f.yearMin != null && (year == null || year < f.yearMin)) return false;
      if (f.yearMax != null && (year == null || year > f.yearMax)) return false;

      if (f.hpMin != null && (hp == null || hp < f.hpMin)) return false;
      if (f.hpMax != null && (hp == null || hp > f.hpMax)) return false;

      return true;
    });
  }, [vehicles, filters]);

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
          const deleteResult = await deleteReservation(
            reservation.reservationId,
            token
          );
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

  const sanitizeMessage = (msg) => {
    if (msg && msg.startsWith("Unexpected token '<'")) {
      return "";
    }
    return msg;
  };

  const clearFilters = () =>
    setFilters({
      name: "",
      color: "",
      engine: "",
      yearMin: "",
      yearMax: "",
      hpMin: "",
      hpMax: "",
    });

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
        token={token}
      />
    );
  }

  return (
    <div className="vehicle-container">
      <h2>List of All Vehicles</h2>

      {/* Search controls */}
      <VehicleSearch filters={filters} setFilters={setFilters} onClear={clearFilters} />

      {/* Tiny helper text */}
      <p style={{ marginTop: -6, marginBottom: 10, fontSize: 12, opacity: 0.8 }}>
        Name/Color/Engine use case-insensitive “contains”. Year/HP filter by min/max.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error loading vehicles: {error}</p>
      ) : vehicles.length === 0 ? (
        <p>No vehicles found.</p>
      ) : (
        <>
          <p style={{ fontSize: 12, opacity: 0.8, margin: "4px 0 8px" }}>
            Showing {filteredVehicles.length} of {vehicles.length}
          </p>
          <VehicleTable
            vehicles={filteredVehicles}
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
        </>
      )}

      <ReservationControls
        canAddVehicle={canAddVehicle}
        canViewAllReservations={canViewAllReservations}
        setShowReserve={setShowReserve}
        setShowAddVehicle={setShowAddVehicle}
        setShowAllCarReservations={setShowAllCarReservations}
        userReservationReset={userReservationReset}
      />
      {message && <p className="profile-message">{sanitizeMessage(message)}</p>}
    </div>
  );
}

export default Reserve;
