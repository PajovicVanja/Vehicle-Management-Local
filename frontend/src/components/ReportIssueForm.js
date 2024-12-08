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
        fetchVehicles(); // Refresh vehicles to reflect the updated status
        setShowReportIssue(false); // Close the form after successful submission
      } else {
        setMessage(result.error || "Failed to report the issue. Please try again.");
      }
    } catch (error) {
      console.error("Error reporting vehicle issue:", error);
      setMessage("An error occurred while reporting the issue.");
    }
  };

  return (
    <div className="report-issue-container">
      <h2>Report Vehicle Issue</h2>
      <form onSubmit={handleReportIssueSubmit}>
        <label htmlFor="issueDescription">Describe the Issue:</label>
        <textarea
          id="issueDescription"
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          placeholder="Describe the problem with the vehicle..."
        />
        <button type="submit" className="submit-button">Submit</button>
        <button onClick={() => setShowReportIssue(false)} className="cancel-button">Cancel</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ReportIssueForm;
