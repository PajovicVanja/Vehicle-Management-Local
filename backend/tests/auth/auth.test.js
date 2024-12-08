const request = require('supertest');
const app = require('../../server');
const { setupTestData } = require('../setup');

jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => {
  req.user = { uid: 'mock-user-id', role: 'Admin' };
  next();
});

describe('Auth Tests', () => {
  beforeAll(async () => {
    await setupTestData();
  });

  test('Fetch User Profile', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer mock-token');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'testuser@example.com');
    expect(res.body).toHaveProperty('role', 'Admin');
  });
});
