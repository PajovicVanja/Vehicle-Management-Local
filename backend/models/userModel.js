const { db } = require('../config/firebaseConfig');
const { doc, setDoc, getDoc } = require('firebase/firestore');

async function createUser(uid, email) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    email: email,
    licenseImageUrl: null,
  });
}

async function getUser(uid) {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data() : null;
}

module.exports = { createUser, getUser };
