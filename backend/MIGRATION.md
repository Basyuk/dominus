# Backend Structure Migration

## Overview of Changes

The old monolithic `server.js` file has been split into a modular architecture:

### Old Structure
```
backend/
├── server.js (1200+ lines)
├── utils/logger.js
└── package.json
```

### New Structure
```
backend/
├── src/
│   ├── app.js                 # Express application
│   ├── server.js              # Entry point
│   ├── config/index.js        # Configuration
│   ├── services/              # Business logic
│   ├── middleware/            # Middleware
│   └── routes/                # API routes
├── utils/logger.js
└── package.json
```

## Key Improvements

### 1. Modularity
- **Services** - isolated business logic
- **Middleware** - reusable components
- **Routes** - organized API endpoints
- **Configuration** - centralized settings

### 2. Readability
- Each file has a single responsibility
- Logical separation of functionality
- Improved code navigation

### 3. Testability
- Isolated modules are easier to test
- Ability to mock dependencies
- Clear interfaces between components

### 4. Scalability
- Easy addition of new features
- Simple API extension
- Horizontal scaling possibilities

## Services

### SessionService
User session management:
- Creating/deleting sessions
- Keycloak token refresh
- Token expiration checking

### KeycloakService
Keycloak SSO integration:
- User authentication
- Token validation
- Authorization code to token exchange
- System logout

### LocalAuthService
Local authentication:
- User verification
- Loading from files and environment variables
- Credential validation

### SettingsService
Configuration management:
- Loading settings from YAML
- Legacy format conversion
- Service type management

### MonitoringService
Service monitoring:
- Status checking
- Priority switching
- Primary/secondary mode management

## Middleware

### authMiddleware
- JWT and Bearer token verification
- Local and Keycloak authentication support
- Automatic token refresh

### requestLogger
- HTTP request logging
- Execution time measurement
- Structured logs

### errorMiddleware
- Centralized error handling
- Safe logging
- Consistent API responses

## Routes

### /api/auth
- Local authentication
- Session management
- Token refresh

### /api/keycloak
- SSO integration
- Callback processing
- Settings diagnostics

### /api/services
- Service monitoring
- Priority management
- Configuration

## Migration

### 1. Update package.json
```json
{
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 2. Install dependencies
```bash
npm install nodemon --save-dev
```

### 3. Check configuration
Make sure all environment variables are configured correctly.

### 4. Testing
```bash
npm run dev
```

## Backward Compatibility

All existing API endpoints are preserved:
- `/api/login` → `/api/auth/login`
- `/api/logout` → `/api/auth/logout`
- `/api/services` → `/api/services`
- `/api/statuses` → `/api/services/statuses`
- `/api/priority` → `/api/services/priority`

## Benefits of New Architecture

1. **Separation of concerns** - each module handles its own domain
2. **Code reuse** - services can be used across different routes
3. **Simplified testing** - each component is tested in isolation
4. **Better debugging** - clear structure simplifies problem finding
5. **Easy extension** - new features are added without changing existing code

## Next Steps

1. Add input data validation
2. Implement caching
3. Add metrics and monitoring
4. Write unit tests for services
5. Add API documentation (Swagger)