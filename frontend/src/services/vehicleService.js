// services/vehicleService.js
import config from '../config';

const API_URL = `${config.API_URL}/vehicle`;

export const getVehicleData = async (token) => {
  try {
    const response = await fetch(`${API_URL}/vehicles`, {
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

export const deleteVehicle = async (vehicleId,token) => {
  try {
    const response = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
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

export const repairVehicle = async (vehicleId,token) => {
  try {
    const response = await fetch(`${API_URL}/vehicles/${vehicleId}/repair`, {
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


export const unreserveVehicle = async (vehicleId,token) => {
  try {
    const response = await fetch(`${API_URL}/vehicles/${vehicleId}/unreserve`, {
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
    const response = await fetch(`${API_URL}/vehicles/${vehicleId}/reserve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reservationData), // Send reservation data in the body
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
    const response = await fetch(`${API_URL}/admin-reservations`, {
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
  console.log('Sending token:', token); // Log the token
  console.log('Sending vehicle ID:', vehicleId); // Log the vehicle ID
  console.log('Sending issue data:', issueData); // Log the issue data

  try {
    const response = await fetch(`${API_URL}/vehicles/${vehicleId}/report-issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Ensure token is sent
      },
      body: JSON.stringify(issueData), // Send issue data in the body
    });

    const data = await response.json();
    console.log('Response data:', data); // Log response data
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Error in reportVehicleIssue service:', error);
    return { success: false, error: error.message };
  }
};

export const getMalfunctionData = async (token) => {
  try {
    const response = await fetch(`${API_URL}/malfunctions`, {
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
    console.error('Error fetching malfunction data:', error);
    return { success: false, error: error.message };
  }
};
