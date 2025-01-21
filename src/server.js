const express = require('express');
const cors = require('cors');
require('dotenv').config();

const tripRoutes = require('./routes/trips');
const activityRoutes = require('./routes/activities');
const scheduleRoutes = require('./routes/schedules');

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/trips', tripRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/schedules', scheduleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});