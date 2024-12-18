require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reimbursementRoutes = require('./routes/reimbursementRoutes');

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'https://company-vehicle-management.web.app',
    'https://company-vehicle-management.firebaseapp.com'
];

app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
}));
app.use(express.json()); // Parse incoming JSON data

// Add a health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/reimbursements', reimbursementRoutes);

module.exports = app; // Export app for testingg
