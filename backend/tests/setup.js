const { db } = require('../config/firebaseConfig');

module.exports.setupTestData = async () => {
  const usersRef = db.collection('users');
  const vehiclesRef = db.collection('vehicles');

  // Mock user
  await usersRef.doc('mock-user-id').set({
    email: 'testuser@example.com',
    role: 'Admin',
  });

  // Mock vehicle
  await vehiclesRef.doc('mock-vehicle-id').set({
    vehicleId: 'mock-vehicle-id',
    vehicleName: 'Test Vehicle',
    status: 'available',
  });
};

module.exports.cleanupTestData = async () => {
  const deleteCollection = async (collectionRef) => {
    const snapshot = await collectionRef.get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  };

  await deleteCollection(db.collection('users'));
  await deleteCollection(db.collection('vehicles'));
};
