import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadLicense from '../components/UploadLicense';

jest.mock('../services/authService', () => ({
  uploadLicense: jest.fn(async () => ({ success: true, message: 'License image uploaded successfully' }))
}));

test('UploadLicense calls service and shows success', async () => {
  render(<UploadLicense token="tok" />);

  const file = new File(['dummy'], 'license.png', { type: 'image/png' });
  const input = screen.getByLabelText(/upload driver's license/i) || screen.getByRole('textbox', { hidden: true }) || screen.getByRole('button', { name: /upload/i });

  // safer: query by input type=file
  const fileInput = screen.getByLabelText(/upload/i) || document.querySelector('input[type="file"]');
  await userEvent.upload(fileInput, file);

  await userEvent.click(screen.getByRole('button', { name: /upload/i }));
  await waitFor(() => expect(screen.getByText(/uploaded successfully/i)).toBeTruthy());
});
