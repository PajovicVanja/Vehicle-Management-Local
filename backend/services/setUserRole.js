const admin = require('firebase-admin');

async function setUserRole(uid, role) {
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`Role '${role}' assigned to user ${uid}`);
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
}

module.exports = { setUserRole };
