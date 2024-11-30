// __tests__/Register.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Register from '../components/Register';

test('renders registration form', () => {
  render(<Register setToken={() => {}} />);
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
});
