// server/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicle');
const reservationRoutes = require('./routes/reservation');

const app = express();

// CORS + body parsing
app.use(cors()); // Using bearer tokens, no cookies; open CORS is fine for local dev
app.use(express.json());

// Health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/reservation', reservationRoutes);

// (Optional) serve CRA build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(buildPath));
  app.get('*', (_req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
