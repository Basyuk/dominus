# Backend Logging System

## Overview

Logging system for backend with configurable levels via environment variables, stdout output support (recommended for Docker) and file logging with rotation.

## Configuration

### Environment Variables

Create a `.env` file in the backend root directory:

```bash
# Logging settings
# Logging levels: ERROR, WARN, INFO, DEBUG, TRACE
LOG_LEVEL=INFO

# Enable/disable logging (true/false)
ENABLE_LOGGING=true

# Log output method: stdout, file, both
# stdout - console only (recommended for Docker)
# file - file only
# both - both console and file
LOG_OUTPUT=stdout

# File logging settings (used only with LOG_OUTPUT=file or both)
LOG_DIR=./logs
LOG_FILE=app.log
LOG_MAX_SIZE=10485760  # 10MB in bytes
LOG_MAX_FILES=5
```

### Logging Levels

1. **ERROR** (0) - Errors only
2. **WARN** (1) - Warnings and errors
3. **INFO** (2) - Informational messages, warnings and errors
4. **DEBUG** (3) - Debug information and above
5. **TRACE** (4) - Detailed debug information

### Log Output Methods

#### stdout (recommended for Docker)
```bash
LOG_OUTPUT=stdout
```
- Logs are output only to console (stdout/stderr)
- Follows 12-factor app principles
- Recommended for containerized applications
- Logs can be collected via Docker logs or external logging systems

#### file
```bash
LOG_OUTPUT=file
```
- Logs are written only to files
- File rotation is supported
- Suitable for standalone applications

#### both
```bash
LOG_OUTPUT=both
```
- Logs are output to both console and files
- Useful for development debugging

## Usage

### Import

```javascript
const logger = require('./utils/logger');
```

### Logging Methods

#### logger.error(message, context)
Logs errors:
```javascript
logger.error('Database connection failed', { 
  host: 'localhost', 
  port: 5432, 
  error: error.message 
});
```

#### logger.warn(message, context)
Logs warnings:
```javascript
logger.warn('Token expired', { 
  userId: '123', 
  tokenAge: '2h' 
});
```

#### logger.info(message, context)
Logs informational messages:
```javascript
logger.info('User logged in successfully', { 
  userId: '123', 
  method: 'keycloak',
  ip: req.ip 
});
```

#### logger.debug(message, context)
Logs debug information:
```javascript
logger.debug('API request details', { 
  url: '/api/services', 
  method: 'GET',
  headers: req.headers 
});
```

#### logger.trace(message, context)
Logs detailed debug information:
```javascript
logger.trace('Function call details', { 
  function: 'validateToken',
  params: { token: '***' },
  stack: new Error().stack 
});
```

#### logger.secure(message, context)
Logs information with automatic sanitization of sensitive data:
```javascript
logger.secure('Authentication attempt', { 
  token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  password: 'secret123',
  clientSecret: 'abc123'
});
// Output: Authentication attempt | {"token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...","password":"[REDACTED]","clientSecret":"[REDACTED]"}
```

### Express Middleware

#### HTTP Request Logging
```javascript
const logger = require('./utils/logger');

// Add middleware for logging all HTTP requests
app.use(logger.request);
```

#### Express Error Logging
```javascript
// Error handling middleware (should be last)
app.use(logger.errorMiddleware);
```

## File Logging

### Automatic Rotation

With `LOG_OUTPUT=file` or `LOG_OUTPUT=both` the system automatically rotates log files:

- **LOG_MAX_SIZE** - maximum file size (default 10MB)
- **LOG_MAX_FILES** - number of rotation files (default 5)

Rotation example:
```
logs/
├── app.log          # current file
├── app.log.1        # previous file
├── app.log.2        # 2 versions back
├── app.log.3        # 3 versions back
└── app.log.4        # 4 versions back
```

### Log Format

```
[2024-01-15T10:30:45.123Z] [12345] [INFO] HTTP Request | {"method":"GET","url":"/api/services","ip":"127.0.0.1","userAgent":"Mozilla/5.0..."}
[2024-01-15T10:30:45.456Z] [12345] [INFO] HTTP Response | {"method":"GET","url":"/api/services","statusCode":200,"duration":"333ms","contentLength":1024}
```

## Docker and stdout Logging

### Recommended Docker Configuration

```bash
# .env for Docker
LOG_OUTPUT=stdout
LOG_LEVEL=INFO
ENABLE_LOGGING=true
```

### Dockerfile Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Set logging environment variables
ENV LOG_OUTPUT=stdout
ENV LOG_LEVEL=INFO
ENV ENABLE_LOGGING=true

EXPOSE 3001

CMD ["node", "server.js"]
```

### Docker Compose Example

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - LOG_OUTPUT=stdout
      - LOG_LEVEL=INFO
      - ENABLE_LOGGING=true
    volumes:
      - ./backend:/app
      - /app/node_modules
```

### Viewing Docker Logs

```bash
# View container logs
docker logs backend

# View logs in real time
docker logs -f backend

# View last 100 lines
docker logs --tail 100 backend

# Filter by level
docker logs backend 2>&1 | grep "\[ERROR\]"
```

## Security

### Automatic Sanitization

The `logger.secure` method automatically removes sensitive data:

- `token`, `password`, `key`, `secret`
- `auth`, `credentials`, `authorization`
- `cookie`, `session`, `jwt`
- `access_token`, `refresh_token`
- `client_secret`, `api_key`

### Manual Sanitization

```javascript
const { sanitizeContext } = require('./utils/logger');

const sensitiveData = {
  token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  password: 'secret123',
  userInfo: { name: 'John', email: 'john@example.com' }
};

const sanitized = sanitizeContext(sensitiveData);
logger.info('User data', sanitized);
```

## Usage Examples

### In Express Routes

```javascript
const express = require('express');
const logger = require('./utils/logger');

const router = express.Router();

router.get('/api/services', async (req, res) => {
  try {
    logger.debug('Getting services', { user: req.sessionUser?.username });
    
    const services = await getServices();
    
    logger.info('Services retrieved successfully', { 
      count: services.length,
      user: req.sessionUser?.username 
    });
    
    res.json(services);
  } catch (error) {
    logger.error('Failed to get services', { 
      error: error.message,
      user: req.sessionUser?.username 
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### In Middleware

```javascript
const logger = require('./utils/logger');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  
  logger.debug('Auth middleware processing', { 
    path: req.path,
    hasToken: !!token 
  });
  
  try {
    // token validation
    const user = validateToken(token);
    req.user = user;
    
    logger.info('User authenticated', { 
      username: user.username,
      method: user.authMethod 
    });
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', { 
      path: req.path,
      error: error.message 
    });
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

### In API Clients

```javascript
const axios = require('axios');
const logger = require('./utils/logger');

async function callExternalAPI(url, data) {
  logger.debug('Calling external API', { url, dataSize: data ? data.length : 0 });
  
  try {
    const response = await axios.post(url, data);
    
    logger.info('External API call successful', { 
      url,
      status: response.status,
      responseSize: response.data ? JSON.stringify(response.data).length : 0
    });
    
    return response.data;
  } catch (error) {
    logger.error('External API call failed', { 
      url,
      error: error.message,
      status: error.response?.status 
    });
    throw error;
  }
}
```

## Debugging

### Getting Configuration

```javascript
const logger = require('./utils/logger');

const config = logger.getConfig();
console.log('Log config:', config);
// {
//   enabled: true,
//   level: 'INFO',
//   currentLevel: 2,
//   availableLevels: ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'],
//   output: 'stdout',
//   logDir: null,
//   logFile: null,
//   maxSize: null,
//   maxFiles: null
// }
```

### Viewing Logs

#### With LOG_OUTPUT=stdout
```bash
# View logs in console
node server.js

# In Docker
docker logs backend

# Filter by level
docker logs backend 2>&1 | grep "\[ERROR\]"
```

#### With LOG_OUTPUT=file or both
```bash
# View current log
tail -f logs/app.log

# View with level filtering
grep "\[ERROR\]" logs/app.log

# View last 100 lines
tail -n 100 logs/app.log

# Search by keyword
grep "authentication" logs/app.log
```

## Recommendations

1. **Use `logger.secure`** for logging data that may contain sensitive information
2. **Add context** to messages for better debugging
3. **Use appropriate levels**:
   - `ERROR` - for errors that require attention
   - `WARN` - for warnings
   - `INFO` - for important events
   - `DEBUG` - for debug information
   - `TRACE` - for detailed debugging
4. **In production** use `ERROR` or `WARN` level
5. **Don't log passwords and tokens** directly
6. **For Docker use `LOG_OUTPUT=stdout`** to follow 12-factor app principles
7. **Configure log rotation** when using file logging

## Environment Variables for Different Environments

### Development
```bash
LOG_LEVEL=DEBUG
ENABLE_LOGGING=true
LOG_OUTPUT=both
LOG_DIR=./logs
LOG_MAX_SIZE=10485760
LOG_MAX_FILES=5
```

### Staging
```bash
LOG_LEVEL=INFO
ENABLE_LOGGING=true
LOG_OUTPUT=stdout
```

### Production
```bash
LOG_LEVEL=ERROR
ENABLE_LOGGING=true
LOG_OUTPUT=stdout
```

### Docker
```bash
LOG_LEVEL=INFO
ENABLE_LOGGING=true
LOG_OUTPUT=stdout
```

### Disable Logging
```bash
ENABLE_LOGGING=false
```

## Log Monitoring

### With LOG_OUTPUT=stdout
```bash
# Docker
docker logs --tail 100 backend | grep "\[ERROR\]"

# Local
node server.js 2>&1 | grep "\[ERROR\]"
```

### With LOG_OUTPUT=file or both
```bash
# Check log size
du -sh logs/
ls -la logs/

# Clean old logs
find logs/ -name "*.log*" -mtime +30 -delete

# Log analysis
grep "$(date -d '1 hour ago' '+%Y-%m-%dT%H')" logs/app.log | grep "\[ERROR\]" | wc -l

# Top errors
grep "\[ERROR\]" logs/app.log | cut -d'|' -f2 | sort | uniq -c | sort -nr
```