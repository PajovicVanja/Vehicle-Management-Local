// __tests__/Profile.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from '../components/Profile';

test('renders profile information', () => {
  render(<Profile token="test-token" setShowProfile={() => {}} />);
  expect(screen.getByText(/Profile/i)).toBeInTheDocument();
});
