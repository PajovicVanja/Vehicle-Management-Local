const path = require('path');
const httpMocks = require('node-mocks-http');
const { createMockDb } = require('./helpers/mockDb');

const authHandlerPath = path.resolve(__dirname, '..', 'auth', '[...path].js');
const verifyAuthPath = path.resolve(__dirname, '..', '_lib', 'verifyAuth.js');
const firebaseAdminPath = path.resolve(__dirname, '..', '_lib', 'firebaseAdmin.js');

describe('Auth API', () => {
  let handler;
  let mockDb;

  beforeEach(() => {
    jest.resetModules();
    mockDb = createMockDb({
      users: {
        // seed user doc without explicit role (defaults to Driver)
        u1: { email: 'admin@example.com' }
      }
    });

    jest.doMock(verifyAuthPath, () => ({
      verifyAuth: jest.fn().mockResolvedValue({ uid: 'u1', role: 'Admin' })
    }));
    jest.doMock(firebaseAdminPath, () => ({ db: mockDb }));

    handler = require(authHandlerPath);
  });

  test('GET /api/auth/profile returns email and default role', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/auth/profile',
      query: { path: ['profile'] },
      headers: { authorization: 'Bearer x' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = res._getJSONData();
    expect(body.email).toBe('admin@example.com');
    expect(body.role).toBe('Driver'); // default when not set
  });

  test('GET /api/auth/profile 404 when user doc missing', async () => {
    // reset with no user doc
    jest.resetModules();
    mockDb = createMockDb({ users: {} });
    jest.doMock(verifyAuthPath, () => ({
      verifyAuth: jest.fn().mockResolvedValue({ uid: 'missing', role: 'Admin' })
    }));
    jest.doMock(firebaseAdminPath, () => ({ db: mockDb }));
    handler = require(authHandlerPath);

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/auth/profile',
      query: { path: ['profile'] },
      headers: { authorization: 'Bearer x' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });
});
