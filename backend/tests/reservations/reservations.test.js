const request = require('supertest');
const app = require('../../server');
const { setupTestData } = require('../setup');

jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => {
  req.user = { uid: 'mock-user-id', role: 'Admin' };
  next();
});

describe('Reservation Tests', () => {
  beforeAll(async () => {
    await setupTestData();
  });

  test('Fetch All Reservations (Admin)', async () => {
    const res = await request(app)
      .get('/api/vehicle/admin-reservations')
      .set('Authorization', 'Bearer mock-token');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Invalid Reservation Request', async () => {
    const res = await request(app)
      .patch('/api/vehicle/vehicles/invalid-vehicle-id/reserve')
      .set('Authorization', 'Bearer mock-token')
      .send({
        startDate: '2024-11-02',
        endDate: '2024-11-03',
      });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Vehicle not found/i);
  });
});
