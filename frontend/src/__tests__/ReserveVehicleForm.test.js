import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReserveVehicleForm from '../components/ReserveVehicleForm';

jest.mock('../services/vehicleService', () => ({
  reserveVehicle: jest.fn(async () => ({ success: true, data: {} }))
}));

// Mock firebase/auth getAuth -> currentUser.uid
jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: { uid: 'u1' } })
}));

test('ReserveVehicleForm submits and calls fetchVehicles', async () => {
  const fetchVehicles = jest.fn();
  render(
    <ReserveVehicleForm
      token="tok"
      reserveVehicleId="veh1"
      setReserveVehicleId={() => {}}
      fetchVehicles={fetchVehicles}
    />
  );

  // Just click submit; default endDate is set
  await userEvent.click(screen.getByRole('button', { name: /reserve/i }));
  // allow async
  await new Promise(r => setTimeout(r, 0));
  expect(fetchVehicles).toHaveBeenCalled();
});
