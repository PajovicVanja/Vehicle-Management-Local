const request = require('supertest');
const app = require('../../server'); // Adjust the path to your server file
const { db } = require('../../config/firebaseConfig');
const cloudinary = require('../../config/cloudinaryConfig');
const { setupTestData } = require('../setup');

jest.mock('../../config/cloudinaryConfig', () => ({
  uploader: {
    upload_stream: jest.fn(),
  },
}));

jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => {
  if (req.originalUrl.includes('/upload-license')) {
    req.user = { uid: 'mock-user-id' };
  } else {
    req.user = { uid: 'mock-user-id', role: 'Admin' };
  }
  next();
});

describe('Auth Controller Tests', () => {
  beforeAll(async () => {
    // Set up common test data for Firestore
    await db.collection('users').doc('mock-user-id').set({
      email: 'test@example.com',
      role: 'Driver',
    });
    await setupTestData(); // Any additional test data setup
  });

  test('Upload License Image', async () => {
    const mockFileBuffer = Buffer.from('mock file content');
    const mockFile = {
      buffer: mockFileBuffer,
      originalname: 'license.png',
      mimetype: 'image/png',
    };

    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      callback(null, { secure_url: 'https://mock-cloudinary-url.com/license.png' });
      return { end: jest.fn() };
    });

    const res = await request(app)
      .post('/api/auth/upload-license')
      .attach('licenseImage', mockFile.buffer, mockFile.originalname)
      .set('Authorization', 'Bearer mock-token');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'License image uploaded successfully');
    expect(res.body).toHaveProperty('imageUrl', 'https://mock-cloudinary-url.com/license.png');

    const userDoc = await db.collection('users').doc('mock-user-id').get();
    expect(userDoc.exists).toBe(true);
    expect(userDoc.data()).toHaveProperty('licenseImageUrl', 'https://mock-cloudinary-url.com/license.png');
  });

  test('Fetch User Profile', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer mock-token');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'test@example.com');
    expect(res.body).toHaveProperty('role', 'Admin');
  });
});
