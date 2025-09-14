// backend/api-gateway/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('../auth-service/routes');
const appointmentRoutes = require('../appointment-service/routes');
const pinoHttp = require('pino-http');
const logger = require('../common/logger');
const requestId = require('../common/requestId');
const { verifyTokenMiddleware } = require('../common/jwt');
const { requireRole } = require('../common/rbac');
const patientRoutes = require('../patient-service/routes');
const rawOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = new Set(rawOrigins);
 const PORT = process.env.PORT || 5000;
const AuditLog = require('../audit-log/model');
const bodyParser = require('body-parser');
const app = express();

/* ---------- Global middleware ---------- */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set('trust proxy', 1);
app.use(requestId());
app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({ reqId: req.id }),
    customLogLevel: (req, res, err) => {
      if (err) return 'error';
      if (res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    serializers: {
      req(req) { return { id: req.id, method: req.method, url: req.url }; },
      res(res) { return { statusCode: res.statusCode }; },
    }
  })
);




app.use(cors({
  origin(origin, cb) {
    // Allow mobile apps / curl / server-to-server with no origin
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

/* ---------- DB connection ---------- */
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

/* ---------- Healthcheck ---------- */
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'api-gateway', time: new Date().toISOString() });
});


/* ---------- Rate Limits ---------- */
// Trust reverse proxy if you deploy behind one (Heroku, Nginx, etc.)
app.set('trust proxy', 1);

// Stricter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 100 * 60 * 1000, // 10 minutes
  max: 40,                   // 30 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth requests. Please try again later.' }
});

// General write limiter (POST/PUT/PATCH/DELETE)
const writeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,                // 100 writes per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many write requests. Please slow down.' }
});

// Apply
app.use('/auth', authLimiter);
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return writeLimiter(req, res, next);
  }
  next();
});



/* ---------- Routes ---------- */
app.use('/auth', authRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/patients', patientRoutes);



// Admin-only audit viewer
app.get(
  '/users',
  verifyTokenMiddleware,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { role } = req.query;
      const filter = {};
      
      if (role) {
        filter.role = role;
      }

      // Fetch users from the database
      const users = await User.find(filter)
        .select('-password -__v -refreshToken') // Exclude sensitive fields
        .lean();

      res.json(users);
    } catch (err) {
      console.error('User fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);


/* ---------- 404 ---------- */
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

/* ---------- Central error handler ---------- */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

/* ---------- Start server ---------- */
app.listen(PORT, () => {
 const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`API Gateway listening on port ${PORT}`);
});

function shutdown(signal) {
  logger.warn({ signal }, 'Shutting down...');
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      logger.info('Mongo connection closed');
      process.exit(0);
    } catch (e) {
      logger.error({ err: e }, 'Error during shutdown');
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

});
