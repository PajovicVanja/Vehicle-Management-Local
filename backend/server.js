const app = require('./index'); // Import the Express app
const PORT = process.env.PORT || 5000;

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; // Export app for testing
