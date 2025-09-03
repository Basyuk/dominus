/**
 * Logging system with configurable levels
 */

// Logging levels (from lowest to highest)
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Get logging level from environment variables
const getLogLevel = () => {
  const envLevel = import.meta.env.VITE_LOG_LEVEL?.toUpperCase();
  return LOG_LEVELS[envLevel] ?? LOG_LEVELS.INFO; // Default to INFO
};

// Check if logging is enabled
const isLoggingEnabled = () => {
  return import.meta.env.VITE_ENABLE_LOGGING !== 'false';
};

// Get current logging level
const currentLogLevel = getLogLevel();

/**
 * Formats message for logging
 * @param {string} level - Logging level
 * @param {string} message - Message
 * @param {object} context - Context (optional)
 * @returns {string} - Formatted message
 */
const formatMessage = (level, message, context = null) => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
};

/**
 * Checks if the specified level should be logged
 * @param {string} level - Level to check
 * @returns {boolean} - true if should log
 */
const shouldLog = (level) => {
  if (!isLoggingEnabled()) return false;
  return LOG_LEVELS[level] <= currentLogLevel;
};

/**
 * Base logging method
 * @param {string} level - Logging level
 * @param {string} message - Message
 * @param {object} context - Context (optional)
 */
const log = (level, message, context = null) => {
  if (!shouldLog(level)) return;

  const formattedMessage = formatMessage(level, message, context);
  
  switch (level) {
    case 'ERROR':
      console.error(formattedMessage);
      break;
    case 'WARN':
      console.warn(formattedMessage);
      break;
    case 'INFO':
      console.info(formattedMessage);
      break;
    case 'DEBUG':
      console.debug(formattedMessage);
      break;
    case 'TRACE':
      console.trace(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
};

/**
 * Logs an error
 * @param {string} message - Error message
 * @param {object} context - Context (optional)
 */
export const logError = (message, context = null) => {
  log('ERROR', message, context);
};

/**
 * Logs a warning
 * @param {string} message - Warning message
 * @param {object} context - Context (optional)
 */
export const logWarn = (message, context = null) => {
  log('WARN', message, context);
};

/**
 * Logs an informational message
 * @param {string} message - Informational message
 * @param {object} context - Context (optional)
 */
export const logInfo = (message, context = null) => {
  log('INFO', message, context);
};

/**
 * Logs debug information
 * @param {string} message - Debug message
 * @param {object} context - Context (optional)
 */
export const logDebug = (message, context = null) => {
  log('DEBUG', message, context);
};

/**
 * Logs detailed debug information
 * @param {string} message - Detailed debug message
 * @param {object} context - Context (optional)
 */
export const logTrace = (message, context = null) => {
  log('TRACE', message, context);
};

/**
 * Logs secure information (without sensitive data)
 * @param {string} message - Message
 * @param {object} context - Context (optional)
 */
export const logSecure = (message, context = null) => {
  // Remove sensitive data from context
  const sanitizedContext = context ? sanitizeContext(context) : null;
  log('INFO', message, sanitizedContext);
};

/**
 * Sanitizes context by removing sensitive data
 * @param {object} context - Context to sanitize
 * @returns {object} - Sanitized context
 */
const sanitizeContext = (context) => {
  if (!context || typeof context !== 'object') {
    return context;
  }

  const sanitized = { ...context };
  const sensitiveKeys = ['token', 'password', 'key', 'secret', 'auth', 'credentials'];
  
  sensitiveKeys.forEach(key => {
    if (sanitized[key]) {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 10) {
        sanitized[key] = sanitized[key].substring(0, 10) + '...';
      } else {
        sanitized[key] = '[REDACTED]';
      }
    }
  });

  return sanitized;
};

/**
 * Gets current logging configuration
 * @returns {object} - Logging configuration
 */
export const getLogConfig = () => {
  return {
    enabled: isLoggingEnabled(),
    level: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === currentLogLevel),
    currentLevel: currentLogLevel,
    availableLevels: Object.keys(LOG_LEVELS)
  };
};

// Export all logging methods
export default {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
  trace: logTrace,
  secure: logSecure,
  getConfig: getLogConfig
};

