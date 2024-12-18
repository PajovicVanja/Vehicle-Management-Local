import config from '../config';

export const uploadLicense = async (file, token) => {
  const formData = new FormData();
  formData.append('licenseImage', file);

  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/auth/upload-license`, {
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

export const getUserData = async (token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/auth/profile`, {
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
