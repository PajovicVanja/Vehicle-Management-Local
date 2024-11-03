// services/authService.js
const API_URL = 'http://localhost:5000/api/auth';

export const uploadLicense = async (file, token) => {
  const formData = new FormData();
  formData.append('licenseImage', file);

  try {
    const response = await fetch(`${API_URL}/upload-license`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Fetch user data including email and license image URL
export const getUserData = async (token) => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};
