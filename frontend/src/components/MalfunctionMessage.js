import React, { useState, useEffect } from "react";
import { getMalfunctionData } from "../services/vehicleService";

const MalfunctionMessage = ({ vehicleId, setShowMessage, token }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessage = async () => {
      setLoading(true);
      try {
        const result = await getMalfunctionData(token);
        if (result.success) {
          const malfunction = result.data.find((m) => m.vehicleId === vehicleId);
          setMessage(malfunction ? malfunction.description : "No message found.");
        } else {
          setError(result.error || "Failed to fetch malfunction message.");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [vehicleId, token]);

  return (
    <div className="malfunction-message">
      <h2>Malfunction Message</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error loading message: {error}</p>
      ) : (
        <p>{message}</p>
      )}
      <button onClick={() => setShowMessage(null)} className="back-button">
        Back
      </button>
    </div>
  );
};

export default MalfunctionMessage;
