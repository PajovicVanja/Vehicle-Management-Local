require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reimbursementRoutes = require('./routes/reimbursementRoutes');

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json()); // Parse incoming JSON data

app.use('/api/auth', authRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/reimbursements', reimbursementRoutes);

module.exports = app; // Export app for testing
