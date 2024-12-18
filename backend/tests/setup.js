const { db } = require('../config/firebaseConfig');

module.exports.setupTestData = async () => {
  try {
    const usersRef = db.collection('users');
    const vehiclesRef = db.collection('vehicles');

    // Mock user
    const userSnapshot = await usersRef.doc('mock-user-id').get();
    if (!userSnapshot.exists) {
      console.log('Creating mock user...');
      await usersRef.doc('mock-user-id').set({
        email: 'testuser@example.com',
        role: 'Admin',
      });
    } else {
      console.log('Mock user already exists.');
    }

    // Mock vehicle
    const vehicleSnapshot = await vehiclesRef.doc('mock-vehicle-id').get();
    if (!vehicleSnapshot.exists) {
      console.log('Creating mock vehicle...');
      await vehiclesRef.doc('mock-vehicle-id').set({
        vehicleId: 'mock-vehicle-id',
        vehicleName: 'Test Vehicle',
        status: 'available', // Vehicle starts as 'available'
        color: 'Blue',
        year: 2022,
        engine: 'V6',
        hp: 300,
        image: 'mock-image-url',
      });
    } else {
      console.log('Mock vehicle already exists.');
    }

    console.log('Setup complete!');
  } catch (error) {
    console.error('Error in setupTestData:', error.message);
  }
};
