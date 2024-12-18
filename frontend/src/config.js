const checkApiAvailability = async (url) => {
  try {
    const response = await fetch(`${url}/health`, { method: 'GET' }); // Assuming your API has a health check endpoint
    return response.ok;
  } catch (error) {
    return false;
  }
};

const getApiUrl = async () => {
  const primaryApi = 'https://rirssolo.onrender.com/api';
  const fallbackApi = 'http://localhost:5000/api';

  const isPrimaryAvailable = await checkApiAvailability(primaryApi);
  return isPrimaryAvailable ? primaryApi : fallbackApi;
};

const config = {
  getApiUrl,
};

export default config;
