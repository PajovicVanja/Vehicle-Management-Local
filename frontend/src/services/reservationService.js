// services/resrvationService.js
import config from '../config';

export const getReservationData = async (token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/reservation/reservation`, {
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

export const getReservation = async (resId, token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/reservation/reservation/${resId}`, {
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

export const deleteReservation = async (resId, token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/reservation/reservation/${resId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
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
