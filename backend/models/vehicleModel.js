const { db } = require('../config/firebaseConfig');
const { doc, getDoc } = require('firebase/firestore');

async function getVehicles(uid) {
  const vehicleRef = doc(db, 'vehicles', uid);
  const docSnap = await getDoc(vehicleRef);
  return docSnap.exists() ? docSnap.data() : null;
}

module.exports = { 
  getVehicles,
};
