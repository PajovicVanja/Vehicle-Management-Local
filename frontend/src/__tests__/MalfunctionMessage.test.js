import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MalfunctionMessage from "../components/MalfunctionMessage";
import { getMalfunctionData } from "../services/vehicleService";

jest.mock("../services/vehicleService", () => ({
  getMalfunctionData: jest.fn(),
}));

describe("MalfunctionMessage", () => {
  it("displays the loading state", () => {
    render(
      <MalfunctionMessage
        vehicleId="mock-vehicle-id"
        setShowMessage={jest.fn()}
        token="mock-token"
      />
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays the malfunction message if found", async () => {
    getMalfunctionData.mockResolvedValueOnce({
      success: true,
      data: [{ vehicleId: "mock-vehicle-id", description: "Test Malfunction" }],
    });

    render(
      <MalfunctionMessage
        vehicleId="mock-vehicle-id"
        setShowMessage={jest.fn()}
        token="mock-token"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Test Malfunction")).toBeInTheDocument();
    });
  });

  it("handles errors gracefully", async () => {
    getMalfunctionData.mockRejectedValueOnce(new Error("Failed to fetch"));

    render(
      <MalfunctionMessage
        vehicleId="mock-vehicle-id"
        setShowMessage={jest.fn()}
        token="mock-token"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Error loading message: Failed to fetch/i)).toBeInTheDocument();
    });
  });
});
