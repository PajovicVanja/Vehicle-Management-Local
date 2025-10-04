// services/vehicleService.js
import config from '../config';

export const createVehicle = async (vehicle, token) => {
  try {
    const API_URL = await config.getApiUrl();
    const res = await fetch(`${API_URL}/vehicle/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(vehicle),
    });
    const data = await res.json();
    if (res.ok) return { success: true, data };
    return { success: false, error: data.message };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const getVehicleData = async (token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/vehicle/vehicles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      throw new Error(`Unexpected response: ${errorText}`);
    }

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

export const deleteVehicle = async (vehicleId, token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/vehicle/vehicles/${vehicleId}`, {
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

export const repairVehicle = async (vehicleId, token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/vehicle/vehicles/${vehicleId}/repair`, {
      method: 'PATCH',
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

export const unreserveVehicle = async (vehicleId, token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/vehicle/vehicles/${vehicleId}/unreserve`, {
      method: 'PATCH',
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

export const reserveVehicle = async (vehicleId, reservationData, token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/vehicle/vehicles/${vehicleId}/reserve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reservationData),
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

export const getAdminReservations = async (token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/vehicle/admin-reservations`, {
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

export const reportVehicleIssue = async (vehicleId, issueData, token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/vehicle/vehicles/${vehicleId}/report-issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(issueData),
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

export const getMalfunctionData = async (token) => {
  try {
    const API_URL = await config.getApiUrl();
    const response = await fetch(`${API_URL}/vehicle/malfunctions`, {
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

