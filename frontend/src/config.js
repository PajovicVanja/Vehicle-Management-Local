// frontend/src/config.js
const ENV_URL = process.env.REACT_APP_API_URL;

const config = {
  getApiUrl: async () => {
    if (ENV_URL) return ENV_URL; // ✅ explicit at build time

    // Fallbacks, only used in dev if you forget to set the env var:
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const onFirebase =
      host.endsWith('.web.app') || host.endsWith('.firebaseapp.com');

    if (onFirebase) {
      return 'https://vehicle-management-git-vui-pajovicvanjas-projects.vercel.app/api';
    }
    return 'http://localhost:3000/api';
  },
};

export default config;
