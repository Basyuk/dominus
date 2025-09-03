# Logging System

## Overview

The logging system allows configuring logging levels through environment variables and includes protection against sensitive data leakage.

## Configuration

### Environment Variables

Create a `.env` file in the frontend root directory:

```bash
# Logging configuration
# Logging levels: ERROR, WARN, INFO, DEBUG, TRACE
VITE_LOG_LEVEL=INFO

# Enable/disable logging (true/false)
VITE_ENABLE_LOGGING=true

# Frontend URL for SSO
VITE_FRONTEND_URL=http://localhost:3001
```

### Logging Levels

1. **ERROR** (0) - Errors only
2. **WARN** (1) - Warnings and errors
3. **INFO** (2) - Informational messages, warnings and errors
4. **DEBUG** (3) - Debug information and above
5. **TRACE** (4) - Detailed debug information

## Usage

### Import

```javascript
import { logError, logWarn, logInfo, logDebug, logTrace, logSecure } from '../utils/logger';
```

### Logging Methods

#### logError(message, context)
Logs errors:
```javascript
logError('API request failed', { endpoint: '/api/services', status: 500 });
```

#### logWarn(message, context)
Logs warnings:
```javascript
logWarn('Token expired', { tokenAge: '2h' });
```

#### logInfo(message, context)
Logs informational messages:
```javascript
logInfo('User logged in successfully', { userId: '123', method: 'keycloak' });
```

#### logDebug(message, context)
Logs debug information:
```javascript
logDebug('API request details', { url: '/api/services', method: 'GET' });
```

#### logTrace(message, context)
Logs detailed debug information:
```javascript
logTrace('Component render details', { props: { token: '***' }, state: { loading: true } });
```

#### logSecure(message, context)
Logs information with automatic sanitization of sensitive data:
```javascript
logSecure('Authentication attempt', { 
  token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  password: 'secret123'
});
// Output: Authentication attempt | {"token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...","password":"[REDACTED]"}
```

### Context

All methods accept an optional context object:

```javascript
logInfo('Service updated', {
  serviceName: 'api-gateway',
  oldStatus: 'secondary',
  newStatus: 'primary',
  timestamp: new Date().toISOString()
});
```

## Usage Examples

### In React Components

```javascript
import React, { useEffect } from 'react';
import { logInfo, logError } from '../utils/logger';

const MyComponent = ({ userId }) => {
  useEffect(() => {
    logInfo('Component mounted', { userId });
    
    return () => {
      logInfo('Component unmounted', { userId });
    };
  }, [userId]);

  const handleClick = () => {
    try {
      // some logic
      logInfo('Button clicked successfully');
    } catch (error) {
      logError('Button click failed', { error: error.message });
    }
  };

  return <button onClick={handleClick}>Click me</button>;
};
```

### In Hooks

```javascript
import { useState, useEffect } from 'react';
import { logDebug, logError } from '../utils/logger';

export const useData = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        logDebug('Fetching data', { url });
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
        logDebug('Data fetched successfully', { dataSize: result.length });
      } catch (error) {
        logError('Failed to fetch data', { url, error: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading };
};
```

### In API Services

```javascript
import { logSecure, logError, logDebug } from '../utils/logger';

class ApiService {
  async request(endpoint, options = {}) {
    logDebug('API request', { endpoint, method: options.method });
    
    try {
      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        logError('API request failed', { 
          endpoint, 
          status: response.status,
          statusText: response.statusText 
        });
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      logSecure('API response received', { endpoint, dataSize: data.length });
      return data;
    } catch (error) {
      logError('API request error', { endpoint, error: error.message });
      throw error;
    }
  }
}
```

## Security

### Automatic Sanitization

The `logSecure` method automatically removes sensitive data:

- `token`
- `password`
- `key`
- `secret`
- `auth`
- `credentials`

### Manual Sanitization

```javascript
import { sanitizeContext } from '../utils/logger';

const sensitiveData = {
  token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  password: 'secret123',
  userInfo: { name: 'John', email: 'john@example.com' }
};

const sanitized = sanitizeContext(sensitiveData);
logInfo('User data', sanitized);
```

## Debugging

### LogConfig Component

In development mode, a component with the current logging configuration is displayed in the bottom right corner.

### Getting Configuration

```javascript
import { getLogConfig } from '../utils/logger';

const config = getLogConfig();
console.log('Log config:', config);
// {
//   enabled: true,
//   level: 'INFO',
//   currentLevel: 2,
//   availableLevels: ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']
// }
```

## Recommendations

1. **Use `logSecure`** for logging data that may contain sensitive information
2. **Add context** to messages for better debugging
3. **Use appropriate levels**:
   - `ERROR` - for errors that require attention
   - `WARN` - for warnings
   - `INFO` - for important events
   - `DEBUG` - for debug information
   - `TRACE` - for detailed debugging
4. **In production** use `ERROR` or `WARN` level
5. **Don't log passwords and tokens** directly

## Environment Variables for Different Environments

### Development
```bash
VITE_LOG_LEVEL=DEBUG
VITE_ENABLE_LOGGING=true
```

### Staging
```bash
VITE_LOG_LEVEL=INFO
VITE_ENABLE_LOGGING=true
```

### Production
```bash
VITE_LOG_LEVEL=ERROR
VITE_ENABLE_LOGGING=true
```

### Disable Logging
```bash
VITE_ENABLE_LOGGING=false
```