require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const authRoutes = require('./routes/auth');
const goalRoutes = require('./routes/goals');
const donationRoutes = require('./routes/donations');

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/donations', donationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
