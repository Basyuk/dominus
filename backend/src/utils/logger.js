const fs = require('fs');
const path = require('path');

// Logging configuration
const config = {
  enabled: process.env.ENABLE_LOGGING !== 'false',
  level: process.env.LOG_LEVEL || 'INFO',
  output: process.env.LOG_OUTPUT || 'stdout',
  logDir: process.env.LOG_DIR || './logs',
  logFile: process.env.LOG_FILE || 'app.log',
  maxSize: parseInt(process.env.LOG_MAX_SIZE) || 10485760, // 10MB
  maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
};

// Logging levels
const LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

const LEVEL_NAMES = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

// Current logging level
const currentLevel = LEVELS[config.level] || LEVELS.INFO;

// Sensitive fields for sanitization
const SENSITIVE_FIELDS = [
  'token', 'password', 'key', 'secret',
  'auth', 'credentials', 'authorization',
  'cookie', 'session', 'jwt',
  'access_token', 'refresh_token',
  'client_secret', 'api_key'
];

// Function for context sanitization
function sanitizeContext(context) {
  if (!context || typeof context !== 'object') {
    return context;
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Function for message formatting
function formatMessage(level, message, context = null) {
  const timestamp = new Date().toISOString();
  const pid = process.pid;
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${pid}] [${level}] ${message}${contextStr}`;
}

// Function for file writing
function writeToFile(message) {
  if (config.output === 'stdout') {
    return;
  }

  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(config.logDir)) {
      fs.mkdirSync(config.logDir, { recursive: true });
    }

    const logPath = path.join(config.logDir, config.logFile);
    
    // Check file size and rotate if needed
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      if (stats.size > config.maxSize) {
        // File rotation
        for (let i = config.maxFiles - 1; i > 0; i--) {
          const oldFile = `${logPath}.${i}`;
          const newFile = `${logPath}.${i + 1}`;
          if (fs.existsSync(oldFile)) {
            if (i === config.maxFiles - 1) {
              fs.unlinkSync(oldFile);
            } else {
              fs.renameSync(oldFile, newFile);
            }
          }
        }
        fs.renameSync(logPath, `${logPath}.1`);
      }
    }

    fs.appendFileSync(logPath, message + '\n');
  } catch (error) {
    console.error('Error writing to log file:', error.message);
  }
}

// Logging function
function log(level, message, context = null) {
  if (!config.enabled || LEVELS[level] > currentLevel) {
    return;
  }

  const formattedMessage = formatMessage(level, message, context);
  
  // Output to stdout
  if (config.output === 'stdout' || config.output === 'both') {
    if (level === 'ERROR') {
      console.error(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }
  
  // Write to file
  if (config.output === 'file' || config.output === 'both') {
    writeToFile(formattedMessage);
  }
}

// Logging methods
const logger = {
  error: (message, context) => log('ERROR', message, context),
  warn: (message, context) => log('WARN', message, context),
  info: (message, context) => log('INFO', message, context),
  debug: (message, context) => log('DEBUG', message, context),
  trace: (message, context) => log('TRACE', message, context),
  
  // Secure logging with automatic sanitization
  secure: (message, context) => {
    const sanitizedContext = sanitizeContext(context);
    log('INFO', message, sanitizedContext);
  },

  // Express middleware for request logging
  request: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const contentLength = res.get('content-length') || 0;
      
      logger.info('HTTP Response', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: parseInt(contentLength),
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
    });

    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    next();
  },

  // Express middleware for error handling
  errorMiddleware: (err, req, res, next) => {
    logger.error('Express error', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip
    });

    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Get configuration
  getConfig: () => ({
    enabled: config.enabled,
    level: config.level,
    currentLevel: currentLevel,
    availableLevels: LEVEL_NAMES,
    output: config.output,
    logDir: config.output === 'stdout' ? null : config.logDir,
    logFile: config.output === 'stdout' ? null : config.logFile,
    maxSize: config.output === 'stdout' ? null : config.maxSize,
    maxFiles: config.output === 'stdout' ? null : config.maxFiles
  }),

  // Export sanitization function
  sanitizeContext
};

module.exports = logger;
