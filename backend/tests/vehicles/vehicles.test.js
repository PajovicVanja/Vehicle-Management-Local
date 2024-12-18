const request = require('supertest');
const app = require('../../server');
const { setupTestData } = require('../setup');
const { db } = require('../../config/firebaseConfig');

jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => {
  req.user = { uid: 'mock-user-id', role: 'Admin' };
  next();
});

describe('Vehicle Tests', () => {
  beforeAll(async () => {
    console.log('Setting up test data...');
    await setupTestData();
    console.log('Test data setup complete.');
  });

  test('Fetch All Vehicles', async () => {
    const res = await request(app)
      .get('/api/vehicle/vehicles')
      .set('Authorization', 'Bearer mock-token');

    console.log('Fetch All Vehicles Response:', res.body);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const mockVehicle = res.body.find((v) => v.vehicleId === 'mock-vehicle-id');
    expect(mockVehicle).toBeDefined();
    expect(mockVehicle).toHaveProperty('vehicleId', 'mock-vehicle-id');
  });

  test('Repair Vehicle', async () => {
    const vehicleId = 'mock-vehicle-id';

    // Update the vehicle's status to 'repair' before testing
    await db.collection('vehicles').doc(vehicleId).update({ status: 'repair' });

    const res = await request(app)
      .patch(`/api/vehicle/vehicles/${vehicleId}/repair`)
      .set('Authorization', 'Bearer mock-token');

    console.log('Repair Vehicle Response:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/status updated/i);
  });

  test('Report Vehicle Issue', async () => {
    const vehicleId = 'mock-vehicle-id';
    const description = 'Test malfunction description';

    // Ensure the vehicle exists
    const vehicleSnapshot = await db.collection('vehicles').doc(vehicleId).get();
    if (!vehicleSnapshot.exists) {
      console.error(`Vehicle with ID ${vehicleId} does not exist.`);
      throw new Error(`Test failed: Vehicle with ID ${vehicleId} is missing.`);
    }

    const res = await request(app)
      .post(`/api/vehicle/vehicles/${vehicleId}/report-issue`)
      .set('Authorization', 'Bearer mock-token')
      .send({ description });

    console.log('Report Vehicle Issue Response:', res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(
      new RegExp(`Issue reported for vehicle ${vehicleId}`, 'i')
    );

    // Verify the status of the vehicle has been updated to "repair"
    const updatedVehicle = await db.collection('vehicles').doc(vehicleId).get();
    expect(updatedVehicle.exists).toBe(true);
    expect(updatedVehicle.data().status).toBe('repair');

    // Ensure the malfunction has been created
    const malfunctions = await db
      .collection('malfunctions')
      .where('vehicleId', '==', vehicleId)
      .get();
    expect(malfunctions.empty).toBe(false);
    console.log('Malfunction Document:', malfunctions.docs[0].data());
  });

  test('Get Malfunction Data', async () => {
    const vehicleId = 'mock-vehicle-id';

    const res = await request(app)
      .get('/api/vehicle/malfunctions')
      .set('Authorization', 'Bearer mock-token');

    console.log('Get Malfunction Data Response:', res.body);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const malfunction = res.body.find((m) => m.vehicleId === vehicleId);
    console.log('Found Malfunction:', malfunction); // Debugging log

    expect(malfunction).toBeDefined();
    expect(malfunction).toHaveProperty('status', 'Pending');
    expect(malfunction).toHaveProperty('description', 'Test malfunction description');
  });

  test('Delete Specific Vehicle', async () => {
    const vehicleId = 'mock-vehicle-id';
    const res = await request(app)
      .delete(`/api/vehicle/vehicles/${vehicleId}`)
      .set('Authorization', 'Bearer mock-token');

    console.log('Delete Vehicle Response:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/successfully deleted/i);

    const fetchRes = await request(app)
      .get(`/api/vehicle/vehicles/${vehicleId}`)
      .set('Authorization', 'Bearer mock-token');

    console.log('Fetch After Delete Response:', fetchRes.body);

    expect(fetchRes.statusCode).toBe(404);
    expect(fetchRes.body.message).toMatch(/Vehicle not found/i);
  });

  test('Fetch Invalid Vehicle', async () => {
    const vehicleId = 'invalid-vehicle-id';
    const res = await request(app)
      .get(`/api/vehicle/vehicles/${vehicleId}`)
      .set('Authorization', 'Bearer mock-token');

    console.log('Fetch Invalid Vehicle Response:', res.body);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Vehicle not found/i);
  });
});
