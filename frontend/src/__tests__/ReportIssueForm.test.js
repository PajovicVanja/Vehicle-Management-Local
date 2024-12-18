import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { reportVehicleIssue } from "../services/vehicleService";
import ReportIssueForm from "../components/ReportIssueForm";
import { getAuth } from "firebase/auth";

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      getIdToken: jest.fn(() => Promise.resolve("mock-token")),
    },
  })),
}));

// Mock Service
jest.mock("../services/vehicleService", () => ({
  reportVehicleIssue: jest.fn(() => Promise.resolve({ success: true })),
}));

describe("ReportIssueForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays a warning if no description is provided", () => {
    render(<ReportIssueForm vehicleId="mock-vehicle-id" setShowReportIssue={jest.fn()} fetchVehicles={jest.fn()} />);
    fireEvent.click(screen.getByText("Submit"));
    expect(screen.getByText(/Please describe the issue/i)).toBeInTheDocument();
  });

  

  it("handles submission failure", async () => {
    reportVehicleIssue.mockResolvedValueOnce({ success: false, error: "Failed to report issue" });

    render(<ReportIssueForm vehicleId="mock-vehicle-id" setShowReportIssue={jest.fn()} fetchVehicles={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Describe the issue"), {
      target: { value: "Test issue description" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to report the issue/i)).toBeInTheDocument();
    });
  });

  it("handles missing currentUser gracefully", async () => {
    jest.mock("firebase/auth", () => ({
      getAuth: jest.fn(() => ({
        currentUser: null, // Simulate no user
      })),
    }));

    render(<ReportIssueForm vehicleId="mock-vehicle-id" setShowReportIssue={jest.fn()} fetchVehicles={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Describe the issue"), {
      target: { value: "Test issue description" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => {
      expect(reportVehicleIssue).not.toHaveBeenCalled(); // Ensure no API call is made
      expect(screen.getByText(/Failed to report the issue/i)).toBeInTheDocument();
    });
  });
});
