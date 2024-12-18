// __tests__/Login.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../components/Login';

test('renders login form', () => {
  render(<Login setToken={() => {}} />);
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
});

test('displays error when login fails', async () => {
  render(<Login setToken={() => {}} />);
  fireEvent.submit(screen.getByRole('button', { name: /Login/i }));
  expect(await screen.findByText(/Error/i)).toBeInTheDocument();
});
