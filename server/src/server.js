const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/halls', require('./routes/hallRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/roommate-matcher', require('./routes/roommateRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/gatepass', require('./routes/gatePassRoutes'));
app.use('/api/mess', require('./routes/messRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/seed', require('./routes/seedRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/bazar', require('./routes/bazarRoutes'));

// Root API Directory
app.get('/', (req, res) => {
  res.json({
    name: 'IUBAT Smart Hall & Residential Management System API',
    version: '1.0.0',
    status: 'online',
    database: 'MongoDB Atlas Connected',
    endpoints: {
      health: '/api/health',
      analytics: '/api/analytics/summary',
      auth: '/api/auth/login',
      users: '/api/users',
      userVerification: '/api/users/verify/:studentId',
      halls: '/api/halls',
      rooms: '/api/rooms',
      applications: '/api/applications',
      applicationTracking: '/api/applications/track/:refOrId',
      roommateMatcher: '/api/roommate-matcher/evaluate',
      complaints: '/api/complaints',
      gatePass: '/api/gatepass',
      mess: '/api/mess/menu',
      notices: '/api/notices',
      seed: '/api/seed',
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Items API Endpoint: http://localhost:${PORT}/api/items\n`);
});
