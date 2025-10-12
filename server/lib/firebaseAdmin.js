// server/lib/firebaseAdmin.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const useAppDefault = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (useAppDefault) {
    // If GOOGLE_APPLICATION_CREDENTIALS is set, use application default creds
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else {
    const {
      FIREBASE_PROJECT_ID,
      FIREBASE_PRIVATE_KEY_ID,
      FIREBASE_PRIVATE_KEY,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_CLIENT_ID,
      FIREBASE_AUTH_URI,
      FIREBASE_TOKEN_URI,
      FIREBASE_AUTH_PROVIDER_CERT_URL,
      FIREBASE_CLIENT_CERT_URL
    } = process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
      throw new Error('Firebase Admin environment variables are missing');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        project_id: FIREBASE_PROJECT_ID,
        private_key_id: FIREBASE_PRIVATE_KEY_ID,
        private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: FIREBASE_CLIENT_EMAIL,
        client_id: FIREBASE_CLIENT_ID,
        auth_uri: FIREBASE_AUTH_URI,
        token_uri: FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: FIREBASE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: FIREBASE_CLIENT_CERT_URL
      })
    });
  }
}

const db = admin.firestore();

module.exports = { admin, db };
