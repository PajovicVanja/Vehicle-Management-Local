// __tests__/ReserveVehicleForm.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import ReserveVehicleForm from '../components/ReserveVehicleForm';

test('renders Reserve Vehicle form', () => {
  render(<ReserveVehicleForm token="test-token" reserveVehicleId="123" setReserveVehicleId={() => {}} fetchVehicles={() => {}} />);
  expect(screen.getByText(/Reserve Vehicle/i)).toBeInTheDocument();
});
