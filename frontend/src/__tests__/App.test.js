// __tests__/App.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

test('renders Vehicle Management System header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Vehicle Management System/i);
  expect(headerElement).toBeInTheDocument();
});

test('switches between login and register views', () => {
    render(<App />);
    const switchButton = screen.getByText(/Switch to Register/i); // Find the button to switch views
    fireEvent.click(switchButton);
    
    // Look specifically for the header text or button based on the role or tag
    const registerHeader = screen.getByRole('heading', { name: /Register/i });
    expect(registerHeader).toBeInTheDocument();
  });
