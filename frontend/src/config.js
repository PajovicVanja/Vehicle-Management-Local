// frontend/src/config.js
const config = {
  getApiUrl: async () => {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const onFirebase = host.endsWith('.web.app') || host.endsWith('.firebaseapp.com');
    if (onFirebase) {
      // use your real Vercel app name below
      return 'https://vehicle-management-frontend-alpha.vercel.app/api';
    }
    // local dev fallbacks:
    // - if running `vercel dev` on port 3000 with CRA on 3000, use explicit origin:
    //   return 'http://localhost:3000/api';
    // - if you deploy both on same origin (rare), '/api' is fine.
    return 'http://localhost:3000/api';
  }
};
export default config;
