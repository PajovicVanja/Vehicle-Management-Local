import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../components/Login';

// Mock firebaseClient exports used by Login
jest.mock('../firebaseClient', () => ({
  auth: {},
  signInWithEmailAndPassword: jest.fn(async () => ({
    user: {
      getIdTokenResult: async () => ({ token: 't123', claims: { role: 'Driver' } })
    }
  }))
}));

test('Login submits and sets token on success', async () => {
  const setToken = jest.fn();
  render(<Login setToken={setToken} />);

  await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
  await userEvent.type(screen.getByPlaceholderText(/password/i), 'pass123');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));

  expect(await screen.findByRole('button', { name: /login/i })).toBeInTheDocument();
  expect(setToken).toHaveBeenCalledWith('t123');
});
