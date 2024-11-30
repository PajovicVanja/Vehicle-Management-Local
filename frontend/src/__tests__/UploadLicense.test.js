// __tests__/UploadLicense.test.js test
import React from 'react';
import { render, screen } from '@testing-library/react';
import UploadLicense from '../components/UploadLicense';

test('renders Upload License form', () => {
  render(<UploadLicense token="test-token" />);
  expect(screen.getByText(/Upload Driver's License/i)).toBeInTheDocument();
});
