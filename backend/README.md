# Backend for Service Monitoring

Modular backend architecture with support for local authentication and Keycloak SSO.

## Project Structure

```
backend/
├── src/
│   ├── app.js                 # Main Express application
│   ├── server.js              # Server entry point
│   ├── config/
│   │   └── index.js           # Application configuration
│   ├── services/
│   │   ├── sessionService.js  # Session management
│   │   ├── keycloakService.js # Keycloak integration
│   │   ├── localAuthService.js # Local authentication
│   │   ├── settingsService.js # Settings management
│   │   └── monitoringService.js # Service monitoring
│   ├── middleware/
│   │   ├── authMiddleware.js  # Authentication
│   │   ├── requestLogger.js   # Request logging
│   │   └── errorMiddleware.js # Error handling
│   └── routes/
│       ├── auth.js            # Authentication routes
│       ├── keycloak.js        # Keycloak routes
│       └── services.js        # Service routes
├── src/
│   ├── utils/
│   │   └── logger.js          # Logging system
├── tests/                     # Tests
├── settings.yml               # Service settings
├── local-users.yml            # Local users
└── package.json
```

## Architecture

### Services
- **SessionService** - user session management
- **KeycloakService** - Keycloak SSO integration
- **LocalAuthService** - local authentication
- **SettingsService** - service configuration management
- **MonitoringService** - service monitoring and management

### Middleware
- **authMiddleware** - authentication verification
- **requestLogger** - HTTP request logging
- **errorMiddleware** - error handling

### Routes
- **/api/auth** - authentication and session management
- **/api/keycloak** - Keycloak integration
- **/api/services** - service monitoring and management

## Running

```bash
# Install dependencies
npm install

# Run in production
npm start

# Run in development mode
npm run dev
```

## Configuration

Create a `.env` file in the backend root:

```env
# Basic settings
PORT=3001
FRONTEND_URL=http://localhost:3001
JWT_SECRET=your-secret-key

# Local authentication
MANAGE_USER=admin
MANAGE_PASSWORD=password
LOCAL_USERS_PATH=./local-users.yml

# Keycloak (optional)
KEYCLOAK_ENABLED=true
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_REDIRECT_URI=http://localhost:3001

# Configuration files
SETTINGS_PATH=./settings.yml
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - local authentication
- `POST /api/auth/logout` - logout from system
- `POST /api/auth/refresh-token` - token refresh
- `GET /api/auth/logout-url` - get logout URL

### Keycloak
- `POST /api/keycloak/callback` - SSO callback
- `POST /api/keycloak/token-callback` - token processing
- `GET /api/keycloak/status` - Keycloak status
- `GET /api/keycloak/config` - frontend configuration

### Services
- `GET /api/services` - service list
- `GET /api/services/configs` - service configurations
- `GET /api/services/statuses` - service statuses
- `PUT /api/services/priority` - change priority
- `PUT /api/services/set-secondary` - set secondary status

## Testing

```bash
# Keycloak test
npm run test-keycloak

# Local authentication test
npm run test-local

# Token refresh test
npm run test-refresh

# Logout test
npm run test-logout
```

## Logging

The logging system supports various levels:
- `error` - errors
- `warn` - warnings
- `info` - informational messages
- `debug` - debug information
- `secure` - secure logging (without passwords)

## Security

- JWT tokens for sessions
- Keycloak Bearer token support
- Input data validation
- Security logging
- Error handling without information leakage