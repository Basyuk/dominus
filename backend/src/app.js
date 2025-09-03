const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
const errorMiddleware = require('./middleware/errorMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const requestLogger = require('./middleware/requestLogger');

// Import routes
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const keycloakRoutes = require('./routes/keycloak');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// API routes
app.use('/api', authRoutes);
app.use('/api', servicesRoutes);
app.use('/api', keycloakRoutes);

// Static files
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Fallback for SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

module.exports = app;
