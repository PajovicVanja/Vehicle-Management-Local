require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();



app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json()); // Parse incoming JSON data

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
