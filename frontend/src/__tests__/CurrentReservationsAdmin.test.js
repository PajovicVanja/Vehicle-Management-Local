import React from 'react';
import { render, screen } from '@testing-library/react';
import CurrentReservationsAdmin from '../components/CurrentReservationsAdmin';

jest.mock('../services/vehicleService', () => ({
  getAdminReservations: jest.fn(async () => ({
    success: true,
    data: {
      success: true,
      data: [
        {
          reservationId: 'r1',
          startDate: '2025-01-01',
          endDate: '2025-01-02',
          status: 'Active',
          user: { email: 'driver@example.com', licenseImageUrl: null },
          vehicle: { vehicleName: 'Car A', color: 'Red', engine: 'V6' }
        }
      ]
    }
  }))
}));

test('Admin reservations table renders a row', async () => {
  render(<CurrentReservationsAdmin token="tok" setShowAllCarReservations={() => {}} />);
  expect(await screen.findByText(/current car reservations/i)).toBeInTheDocument();
  expect(await screen.findByText('Car A')).toBeInTheDocument();
  expect(screen.getByText('driver@example.com')).toBeInTheDocument();
});
