// __tests__/ReserveVehicle.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Reserve from '../components/ReserveVehicle';

test('renders reserve vehicle view', () => {
  render(<Reserve token="test-token" setShowReserve={() => {}} setShowAddVehicle={() => {}} />);
  expect(screen.getByText(/List of all vehicles/i)).toBeInTheDocument();
});
