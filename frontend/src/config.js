// super simple: same-origin by default; can still override in envv
const config = {
  getApiUrl: async () => process.env.REACT_APP_API_URL || '/api',
};
export default config;
