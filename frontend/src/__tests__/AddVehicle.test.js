// __tests__/AddVehicle.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import AddVehicle from '../components/AddVehicle';

test('renders Add Vehicle form', () => {
  render(<AddVehicle token="test-token" setShowAddVehicle={() => {}} />);
  expect(screen.getByPlaceholderText(/Vehicle Name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Vehicle Year/i)).toBeInTheDocument();
});
