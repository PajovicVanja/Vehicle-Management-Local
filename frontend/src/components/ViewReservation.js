// components/ViewReservation.js
import React, { useState, useEffect } from 'react';
import '../CSS/UploadLicense.css';
import '../CSS/ReserveVehicle.css';

import { getVehicleData, unreserveVehicle, reportVehicleIssue } from '../services/vehicleService';
import { deleteReservation } from '../services/reservationService';

function ViewRes({ token, reservationData, onReservationCleared }) {
  const [vehicles, setVehicles] = useState([]);
  const [userVehicle, setUserVehicle] = useState(null);

  // UI for actions on dashboard
  const [actionMsg, setActionMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicleSnapshot = await getVehicleData(token);
        if (vehicleSnapshot.success) {
          setVehicles(vehicleSnapshot.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchVehicles();
  }, [token]);

  useEffect(() => {
    if (vehicles.length > 0) {
      const v = vehicles.find(v => v.vehicleId === reservationData.vehicleId);
      setUserVehicle(v || null);
    }
  }, [vehicles, reservationData.vehicleId]);

  const clearReservationInParent = () => {
    if (typeof onReservationCleared === 'function') {
      onReservationCleared();
    }
  };

  const handleRemoveReservation = async () => {
    if (!reservationData?.reservationId || !reservationData?.vehicleId) return;
    setSubmitting(true);
    setActionMsg('');
    try {
      // 1) Mark vehicle available
      const unreserve = await unreserveVehicle(reservationData.vehicleId, token);
      if (!unreserve.success) {
        setActionMsg(unreserve.error || 'Failed to unreserve vehicle.');
        setSubmitting(false);
        return;
      }

      // 2) Delete the reservation doc
      const del = await deleteReservation(reservationData.reservationId, token);
      if (!del.success) {
        setActionMsg(del.error || 'Failed to delete reservation.');
        setSubmitting(false);
        return;
      }

      setActionMsg('Reservation removed.');
      clearReservationInParent();
    } catch (e) {
      console.error('Remove reservation error:', e);
      setActionMsg('An error occurred while removing the reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) {
      setActionMsg('Please describe the issue.');
      return;
    }
    setSubmitting(true);
    setActionMsg('');
    try {
      // Backend sets vehicle to "repair" and deletes active reservations for this vehicle.
      const res = await reportVehicleIssue(reservationData.vehicleId, { description: issueDescription.trim() }, token);
      if (!res.success) {
        setActionMsg(res.error || 'Failed to report issue.');
      } else {
        setActionMsg('Issue reported. Reservation has been cleared.');
        clearReservationInParent();
      }
    } catch (e) {
      console.error('Report issue error:', e);
      setActionMsg('An error occurred while reporting the issue.');
    } finally {
      setSubmitting(false);
      setShowReportForm(false);
      setIssueDescription('');
    }
  };

  if (!userVehicle) return <></>;

  return (
    <div className="reservation-container">
      <h2>Your Current Reservation</h2>
      <table className="vehicle-table">
        <tbody>
          <tr>
            <td><strong>Vehicle Name:</strong></td>
            <td>{userVehicle.vehicleName}</td>
          </tr>
          <tr>
            <td><strong>Start Date:</strong></td>
            <td>{reservationData.startDate}</td>
          </tr>
          <tr>
            <td><strong>End Date:</strong></td>
            <td>{reservationData.endDate}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td>{reservationData.status}</td>
          </tr>
        </tbody>
      </table>

      <div className="button-group" style={{ marginTop: 12 }}>
        <button
          className="goto-register-button"
          onClick={handleRemoveReservation}
          disabled={submitting}
        >
          {submitting ? 'Processing…' : 'Remove Reservation'}
        </button>

        {!showReportForm ? (
          <button
            className="goto-register-button"
            onClick={() => setShowReportForm(true)}
            disabled={submitting}
          >
            Report Issue
          </button>
        ) : null}
      </div>

      {showReportForm && (
        <form onSubmit={handleReportIssue} style={{ marginTop: 12 }}>
          <textarea
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Describe the issue"
            rows={4}
            style={{ width: '100%', maxWidth: 480 }}
          />
          <div className="button-group" style={{ marginTop: 8 }}>
            <button className="goto-register-button" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Issue'}
            </button>
            <button
              type="button"
              className="goto-register-button"
              onClick={() => {
                setShowReportForm(false);
                setIssueDescription('');
              }}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {actionMsg && <p className="profile-message" style={{ marginTop: 10 }}>{actionMsg}</p>}
    </div>
  );
}

export default ViewRes;
