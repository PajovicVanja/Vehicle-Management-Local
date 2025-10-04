// jest.config.js
module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  verbose: true,
  // Only run the backend tests from here (frontend runs with CRA)
  testMatch: ['<rootDir>/api/**/__tests__/**/*.test.js']
};
