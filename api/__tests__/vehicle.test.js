const path = require('path');
const httpMocks = require('node-mocks-http');
const { createMockDb } = require('./helpers/mockDb');

const vehicleHandlerPath = path.resolve(__dirname, '..', 'vehicle', '[...path].js');
const verifyAuthPath = path.resolve(__dirname, '..', '_lib', 'verifyAuth.js');
const firebaseAdminPath = path.resolve(__dirname, '..', '_lib', 'firebaseAdmin.js');

describe('Vehicle API', () => {
  let handler;
  let mockDb;

  const seed = () => ({
    users: {
      u1: { email: 'admin@example.com', role: 'Admin' }
    },
    vehicles: {
      veh1: { vehicleId: 'veh1', vehicleName: 'Car A', engine: 'V6', hp: '200', color: 'Red', year: '2020', status: 'available' },
      veh2: { vehicleId: 'veh2', vehicleName: 'Car B', engine: 'I4', hp: '120', color: 'Blue', year: '2019', status: 'repair' }
    },
    reservation: {},
    malfunctions: {}
  });

  beforeEach(() => {
    jest.resetModules();
    mockDb = createMockDb(seed());

    jest.doMock(verifyAuthPath, () => ({
      verifyAuth: jest.fn().mockResolvedValue({ uid: 'u1', role: 'Admin' })
    }));
    jest.doMock(firebaseAdminPath, () => ({ db: mockDb }));

    handler = require(vehicleHandlerPath);
  });

  test('GET /api/vehicle/vehicles returns list', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/vehicle/vehicles',
      query: { path: ['vehicles'] },
      headers: { authorization: 'Bearer x' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = res._getJSONData();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
  });

  test('PATCH /vehicles/:id/reserve succeeds when available', async () => {
    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/api/vehicle/vehicles/veh1/reserve',
      query: { path: ['vehicles', 'veh1', 'reserve'] },
      headers: { authorization: 'Bearer x' },
      body: { startDate: '2025-01-01', endDate: '2025-01-03' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    // Verify vehicle status changed from "available" to reservationId (some auto id)
    const vehSnap = await mockDb.collection('vehicles').doc('veh1').get();
    const veh = vehSnap.data();
    expect(veh.status).toMatch(/^auto_/);

    // Verify reservation created
    const reservations = (await mockDb.collection('reservation').get()).docs.map(d => d.data());
    expect(reservations.length).toBe(1);
    expect(reservations[0].vehicleId).toBe('veh1');
  });

  test('PATCH /vehicles/:id/reserve fails when not available', async () => {
    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/api/vehicle/vehicles/veh2/reserve',
      query: { path: ['vehicles', 'veh2', 'reserve'] },
      headers: { authorization: 'Bearer x' },
      body: { startDate: '2025-01-01', endDate: '2025-01-03' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  test('PATCH /vehicles/:id/unreserve sets status to available', async () => {
    // First, simulate reserved status
    await mockDb.collection('vehicles').doc('veh1').update({ status: 'auto_999' });

    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/api/vehicle/vehicles/veh1/unreserve',
      query: { path: ['vehicles', 'veh1', 'unreserve'] },
      headers: { authorization: 'Bearer x' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const veh = (await mockDb.collection('vehicles').doc('veh1').get()).data();
    expect(veh.status).toBe('available');
  });

  test('POST /vehicles/:id/report-issue sets vehicle to repair, adds malfunction, deletes active reservations', async () => {
    // Seed an active reservation for veh1
    const rRef = mockDb.collection('reservation').doc('r1');
    await rRef.set({
      reservationId: 'r1',
      vehicleId: 'veh1',
      userId: 'u1',
      status: 'Active',
      startDate: '2025-01-01',
      endDate: '2025-01-02'
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/vehicle/vehicles/veh1/report-issue',
      query: { path: ['vehicles', 'veh1', 'report-issue'] },
      headers: { authorization: 'Bearer x' },
      body: { description: 'brake noise' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);
    expect(res._getStatusCode()).toBe(201);

    const veh = (await mockDb.collection('vehicles').doc('veh1').get()).data();
    expect(veh.status).toBe('repair');

    const mal = (await mockDb.collection('malfunctions').get()).docs.map(d => d.data());
    expect(mal.length).toBe(1);
    expect(mal[0].description).toBe('brake noise');

    const reservations = (await mockDb.collection('reservation').get()).docs.map(d => d.data());
    expect(reservations.length).toBe(0); // active reservation deleted
  });

  test('GET /api/vehicle/admin-reservations aggregates vehicle and user info', async () => {
    // Seed a reservation and related docs
    const resRef = mockDb.collection('reservation').doc('r2');
    await resRef.set({
      reservationId: 'r2',
      vehicleId: 'veh1',
      userId: 'u1',
      startDate: '2025-02-01',
      endDate: '2025-02-03',
      status: 'Active'
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/vehicle/admin-reservations',
      query: { path: ['admin-reservations'] },
      headers: { authorization: 'Bearer x' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = res._getJSONData();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data[0].vehicle.vehicleName).toBe('Car A');
    expect(body.data[0].user.email).toBe('admin@example.com');
  });
});
