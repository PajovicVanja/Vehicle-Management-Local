// __tests__/Navigation.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

test('navigates to different views', () => {
    render(<App />);
    
    // Assert the "Login" header is present
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
  
    // Navigate to Register
    fireEvent.click(screen.getByText(/Switch to Register/i));
    
    // Assert the "Register" header is present
    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
  });
