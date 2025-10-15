// frontend/src/firebaseConfig.js
const required = (name, val) => {
  if (!val) {
    throw new Error(`Missing ${name}. Did you set it in frontend/.env.local?`);
  }
  return val;
};

const firebaseConfig = {
  apiKey: required('REACT_APP_FIREBASE_API_KEY', process.env.REACT_APP_FIREBASE_API_KEY),
  authDomain: required('REACT_APP_FIREBASE_AUTH_DOMAIN', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN),
  projectId: required('REACT_APP_FIREBASE_PROJECT_ID', process.env.REACT_APP_FIREBASE_PROJECT_ID),
  storageBucket: required('REACT_APP_FIREBASE_STORAGE_BUCKET', process.env.REACT_APP_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: required('REACT_APP_FIREBASE_MESSAGING_SENDER_ID', process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
  appId: required('REACT_APP_FIREBASE_APP_ID', process.env.REACT_APP_FIREBASE_APP_ID),
};

export default firebaseConfig;
