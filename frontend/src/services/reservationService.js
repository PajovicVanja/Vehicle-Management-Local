// services/resrvationService.js
const API_URL = 'http://localhost:5000/api/reservation';

// Fetch all reservations
export const getReservationData = async (token) => {
    try {
      const response = await fetch(`${API_URL}/reservation`, {
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

// Fetch one reservation
export const getReservation = async (resId, token) => {
    try {
      const response = await fetch(`${API_URL}/reservation/${resId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      //console.log(data);
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  export const deleteReservation = async (resId,token) => {
    try {
      const response = await fetch(`${API_URL}/reservation/${resId}`, {
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