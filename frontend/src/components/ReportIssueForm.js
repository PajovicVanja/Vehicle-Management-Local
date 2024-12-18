// components/ReportIssueForm.js
import React, { useState } from "react";
import { reportVehicleIssue } from "../services/vehicleService"; // Import the service function
import { getAuth } from "firebase/auth"; // Import Firebase Authentication

function ReportIssueForm({ vehicleId, setShowReportIssue, fetchVehicles }) {
  const [issueDescription, setIssueDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleReportIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueDescription) {
      setMessage("Please describe the issue before submitting.");
      return;
    }

    try {
      // Fetch the Firebase token
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      console.log("Fetched Firebase token:", token); // Debugging log

      // Call the service to report the issue
      const result = await reportVehicleIssue(vehicleId, { description: issueDescription }, token);
      if (result.success) {
        setMessage("Issue reported successfully.");
        fetchVehicles(); // Refresh the vehicle data
        setShowReportIssue(null); // Close the form
      } else {
        setMessage(result.error);
      }
    } catch (error) {
      console.error("Error reporting issue:", error);
      setMessage("Failed to report the issue. Please try again.");
    }
  };

  return (
    <div className="report-issue-form">
      <h2>Report Issue</h2>
      <form onSubmit={handleReportIssueSubmit}>
        <textarea
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          placeholder="Describe the issue"
        />
        <button type="submit">Submit</button>
      </form>
      {message && <p className="error-message">{message}</p>}
    </div>
  );
}

export default ReportIssueForm;
