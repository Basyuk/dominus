const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log incoming request
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Intercept request completion for logging
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
}

module.exports = requestLogger;
