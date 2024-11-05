// services/vehicleService.js
const API_URL = 'http://localhost:5000/api/vehicle';

// Fetch vehicle data
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
