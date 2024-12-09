import { render, screen, fireEvent } from "@testing-library/react";
import VehicleRow from "../components/VehicleRow";

describe("VehicleRow", () => {
  const mockVehicle = {
    vehicleId: "mock-vehicle-id",
    vehicleName: "Test Vehicle",
    engine: "V6",
    hp: 300,
    status: "available",
  };

  it("renders vehicle details", () => {
    render(
      <VehicleRow
        vehicle={mockVehicle}
        userReservation={null}
        canRepairVehicle={false}
        canDeleteVehicle={false}
        handleView={jest.fn()}
        handleReserve={jest.fn()}
        removeReserve={jest.fn()}
        setReportIssueVehicleId={jest.fn()}
        handleRepair={jest.fn()}
        handleDelete={jest.fn()}
        handleViewMessage={jest.fn()}
      />
    );

    expect(screen.getByText("Test Vehicle")).toBeInTheDocument();
    expect(screen.getByText("V6 - 300 HP")).toBeInTheDocument();
  });

  it("calls handleReserve when reserve button is clicked", () => {
    const handleReserveMock = jest.fn();

    render(
      <VehicleRow
        vehicle={mockVehicle}
        userReservation={null}
        canRepairVehicle={false}
        canDeleteVehicle={false}
        handleView={jest.fn()}
        handleReserve={handleReserveMock}
        removeReserve={jest.fn()}
        setReportIssueVehicleId={jest.fn()}
        handleRepair={jest.fn()}
        handleDelete={jest.fn()}
        handleViewMessage={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText("Reserve"));
    expect(handleReserveMock).toHaveBeenCalledWith("mock-vehicle-id");
  });

  it("shows repair button when canRepairVehicle is true", () => {
    render(
      <VehicleRow
        vehicle={{ ...mockVehicle, status: "repair" }}
        userReservation={null}
        canRepairVehicle={true}
        canDeleteVehicle={false}
        handleView={jest.fn()}
        handleReserve={jest.fn()}
        removeReserve={jest.fn()}
        setReportIssueVehicleId={jest.fn()}
        handleRepair={jest.fn()}
        handleDelete={jest.fn()}
        handleViewMessage={jest.fn()}
      />
    );

    expect(screen.getByText("Repair")).toBeInTheDocument();
  });
});
