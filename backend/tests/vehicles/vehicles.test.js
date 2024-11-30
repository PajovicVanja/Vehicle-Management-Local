const request = require('supertest');
const app = require('../../server');
const { setupTestData, cleanupTestData } = require('../setup');

jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => {
  req.user = { uid: 'mock-user-id', role: 'Admin' }; // Mock user data
  next();
});

describe('Vehicle Tests', () => {
  beforeAll(async () => {
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  test('Fetch All Vehicles', async () => {
    const res = await request(app)
      .get('/api/vehicle/vehicles')
      .set('Authorization', 'Bearer mock-token');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('vehicleId', 'mock-vehicle-id');
  });

  test('Repair Vehicle', async () => {
    const vehicleId = 'mock-vehicle-id';
    const res = await request(app)
      .patch(`/api/vehicle/vehicles/${vehicleId}/repair`)
      .set('Authorization', 'Bearer mock-token');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/status updated/i);
  });

  test('Delete Vehicle', async () => {
    const vehicleId = 'mock-vehicle-id';
    const res = await request(app)
      .delete(`/api/vehicle/vehicles/${vehicleId}`)
      .set('Authorization', 'Bearer mock-token');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/successfully deleted/i);
  });

  test('Fetch Invalid Vehicle', async () => {
    const vehicleId = 'invalid-vehicle-id';
    const res = await request(app)
      .get(`/api/vehicle/vehicles/${vehicleId}`)
      .set('Authorization', 'Bearer mock-token');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Vehicle not found/i);
  });
});
