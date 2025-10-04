const path = require('path');
const httpMocks = require('node-mocks-http');
const { createMockDb } = require('./helpers/mockDb');

const reservationHandlerPath = path.resolve(__dirname, '..', 'reservation', '[...path].js');
const verifyAuthPath = path.resolve(__dirname, '..', '_lib', 'verifyAuth.js');
const firebaseAdminPath = path.resolve(__dirname, '..', '_lib', 'firebaseAdmin.js');

describe('Reservation API', () => {
  let handler;
  let mockDb;

  beforeEach(() => {
    jest.resetModules();
    mockDb = createMockDb({
      reservation: {
        r1: { reservationId: 'r1', vehicleId: 'veh1', userId: 'u1', status: 'Active' },
        r2: { reservationId: 'r2', vehicleId: 'veh2', userId: 'u2', status: 'Cancelled' }
      }
    });

    jest.doMock(verifyAuthPath, () => ({
      verifyAuth: jest.fn().mockResolvedValue({ uid: 'u1', role: 'Admin' })
    }));
    jest.doMock(firebaseAdminPath, () => ({ db: mockDb }));

    handler = require(reservationHandlerPath);
  });

  test('GET /api/reservation/reservation returns all reservations', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/reservation/reservation',
      query: { path: ['reservation'] },
      headers: { authorization: 'Bearer x' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const body = res._getJSONData();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
  });

  test('DELETE /api/reservation/reservation/:id deletes by reservationId', async () => {
    const req = httpMocks.createRequest({
      method: 'DELETE',
      url: '/api/reservation/reservation/r1',
      query: { path: ['reservation', 'r1'] },
      headers: { authorization: 'Bearer x' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);

    const remaining = (await mockDb.collection('reservation').get()).docs.map(d => d.data());
    expect(remaining.length).toBe(1);
    expect(remaining[0].reservationId).toBe('r2');
  });
});
