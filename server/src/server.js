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

const path = require('path');
const fs = require('fs');

// Middleware
app.use(cors({
  origin: true,
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
app.use('/payment', require('./routes/paymentRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/seed', require('./routes/seedRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/bazar', require('./routes/bazarRoutes'));

// API Directory Endpoint
const apiDirectoryHandler = (req, res) => {
  res.json({
    name: 'Hostel Seat Allocation Management System API',
    version: '1.0.0',
    status: 'online',
    database: 'MongoDB Connected',
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
      bazar: '/api/bazar/requisitions',
      notices: '/api/notices',
      seed: '/api/seed',
    },
  });
};

app.get('/api', apiDirectoryHandler);

// Connect and Serve Client Build (Production / Full-Stack mode)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const rootDistPath = path.resolve(__dirname, '../../dist');
const distPath = fs.existsSync(clientDistPath) ? clientDistPath : (fs.existsSync(rootDistPath) ? rootDistPath : null);

if (distPath) {
  console.log(`📦 Serving connected client build from: ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback for all non-API GET requests
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/payment')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If client is not yet built, serve API directory on root
  app.get('/', apiDirectoryHandler);
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Items API Endpoint: http://localhost:${PORT}/api/items\n`);
});
