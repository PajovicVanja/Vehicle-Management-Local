// Point the frontend to Vercel serverless API under the same domain
const config = {
  getApiUrl: async () => '/api'
};

export default config;
