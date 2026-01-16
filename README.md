# Dominus - Server Priority Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js Version](https://img.shields.io/badge/node.js-%3E%3D18.0.0-brightgreen)
![React Version](https://img.shields.io/badge/react-%3E%3D18.0.0-blue)
![GitHub Issues](https://img.shields.io/github/issues/Basyuk/dominus)
![GitHub Stars](https://img.shields.io/github/stars/Basyuk/dominus)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-🌐-green)](https://dominus.odinone.top)
[![Crypto Donate](https://img.shields.io/badge/Crypto%20Donations-₿-f7931a)](https://nowpayments.io/donation/dominus)
[![Bitcoin](https://img.shields.io/badge/Bitcoin-₿-FF9900)](bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh)
[![Ethereum](https://img.shields.io/badge/Ethereum-⟠-627EEA)](https://nowpayments.io/donation/dominus)

**Frontend management system** for controlling server priorities and roles across multiple backend services through a unified web interface.

## 🌐 Live Demo

**Try Dominus in action!** 🚀

**Demo URL:** [https://dominus.odinone.icu](https://dominus.odinone.icu)

**Login credentials:**
- **Username:** `admin`
- **Password:** `admin123`

*Note: This is a demo environment for testing purposes. Your changes won't affect real systems.*

---

## 🎯 System Overview

Dominus is a **frontend management system** that provides a centralized interface for managing server priorities across multiple backend services. The system itself doesn't provide status data - it acts as a control panel that communicates with your backend services to:
- Retrieve current server statuses
- Switch server roles (primary ↔ secondary)
- Monitor backend service health

## 🚀 Features

- **Centralized Priority Control** - Single interface to manage all backend services
- **Backend Service Integration** - Easy configuration via `settings.yml` file
- **Real-time Role Switching** - Instant priority changes with automatic failover
- **Flexible Backend Support** - Works with any HTTP-compatible backend service
- **Custom Backend Development** - Create your own backend services following simple API contract
- **Dual Authentication** - Keycloak SSO or local user management
- **Progress Tracking** - Real-time operation progress with detailed feedback
- **Secure Configuration** - Centralized service configuration management
- **Docker Support** - Easy deployment with Docker containers

## 🔧 Backend Services

Dominus works with backend services that implement a simple HTTP API for status and priority management.

### Official Backend Services

- **[dominus-status](https://github.com/Basyuk/dominus-status)** - Service status management backend
- **[dominus-mongo](https://github.com/Basyuk/dominus-mongo)** - MongoDB cluster priority management

### Custom Backend Development

You can create your own backend services. Each service must implement:
- **Status endpoint** - Single HTTP request to get current server status
- **Priority endpoint** - Single HTTP request to change server priority

Both endpoints are fully configurable in `settings.yml`.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Backend Services](#backend-services)
- [Configuration](#configuration)
- [Authentication Setup](#authentication-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Issues and Support](#issues-and-support)
- [Security](#security)
- [License](#license)

## 🚀 Quick Start

### Using Installation Script

```bash
git clone https://github.com/Basyuk/dominus.git
cd dominus
chmod +x install.sh
./install.sh
```

### Manual Setup

```bash
git clone https://github.com/Basyuk/dominus.git
cd dominus

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies  
cd frontend
npm install
cd ..
```

## 🔧 Installation

### 1. Environment Setup

#### Automated Logging Setup

```bash
# Frontend logging setup
cd frontend && ./setup-logging.sh && cd ..

# Backend logging setup  
cd backend && ./setup-logging.sh && cd ..
```

#### Manual Environment Configuration

**Backend** (`backend/.env`):
```bash
# Main Application Settings
PORT=3001
JWT_SECRET=your-secure-jwt-secret-here
FRONTEND_URL=http://localhost:3001

# Local Authentication
MANAGE_USER=admin
MANAGE_PASSWORD=secure-admin-password
LOCAL_USERS_PATH=./local-users.yml

# Service Configuration
SETTINGS_PATH=./settings.yml

# Logging Configuration
LOG_LEVEL=INFO
ENABLE_LOGGING=true
LOG_OUTPUT=stdout

# Keycloak SSO (Optional)
KEYCLOAK_ENABLED=false
KEYCLOAK_BASE_URL=https://your-keycloak-server
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=dominus-client
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

**Frontend** (`frontend/.env`):
```bash
# Application URL
VITE_FRONTEND_URL=http://localhost:3001

# Logging Configuration
VITE_LOG_LEVEL=INFO
VITE_ENABLE_LOGGING=true
```

### 2. Configuration Files

#### Local Users Setup

Copy and configure local users:
```bash
cp backend/local-users.example.yml backend/local-users.yml
```

**Example `backend/local-users.yml`:**
```yaml
# Format: username: password
admin: secure-admin-password
operator: operator-password
monitor: readonly-password
```

#### Backend Services Configuration

The `settings.yml` file is the heart of Dominus configuration. It defines how Dominus communicates with your backend services.

Copy and configure services:
```bash
cp backend/settings.example.yml backend/settings.yml
```

**Configuration Structure:**

Each backend service type defines **exactly two HTTP endpoints**:
- **Status endpoint** - Single request to get current server status
- **Priority endpoint** - Single request to change server priority

**Example `backend/settings.yml`:**
```yaml
Types:
  - name: dominus-status-service
    status:
      path: /api/status          # Single endpoint for all servers status
      method: GET
      timeout: 5000
    priority:
      path: /api/priority        # Single endpoint to change priority
      method: PUT
      timeout: 10000
      params: 
        primary: "role=primary"    # URL params for primary role
        secondary: "role=secondary" # URL params for secondary role

  - name: dominus-mongo-service
    status:
      path: /mongo/cluster/status
      method: GET
      timeout: 3000
    priority:
      path: /mongo/cluster/priority
      method: POST
      timeout: 15000
      body:                      # JSON body for priority change
        action: "change_priority"
      params: 
        primary: "target_role=primary"
        secondary: "target_role=secondary"

Services:
  - name: web-cluster
    type: dominus-status-service
    primary_mode: only_one       # only_one | many
    url:
      - http://backend1.example.com:8080
      - http://backend2.example.com:8080

  - name: mongo-replica
    type: dominus-mongo-service
    primary_mode: many           # multiple primaries allowed
    url:
      - http://mongo1.example.com:27017
      - http://mongo2.example.com:27017
      - http://mongo3.example.com:27017
```

**Key Configuration Principles:**

1. **Single Request Rule** - Each operation (status/priority) uses only one HTTP request
2. **Type Reusability** - Define a type once, use for multiple services
3. **Flexible Parameters** - Support for URL params, JSON body, custom headers
4. **Priority Modes**:
   - `only_one` - Only one server can be primary (classic failover)
   - `many` - Multiple servers can be primary simultaneously

### Creating Custom Backend Services

To create your own backend service compatible with Dominus, implement these HTTP endpoints:

#### Status Endpoint
Returns current status of all servers in a single response:

```http
GET /your/status/endpoint
Response: {
  "server1": { "status": "primary", "health": "ok" },
  "server2": { "status": "secondary", "health": "ok" }
}
```

#### Priority Endpoint  
Changes server priority based on URL parameters:

```http
PUT /your/priority/endpoint?role=primary&server=server1
Response: { "success": true, "message": "Priority changed" }
```

**Implementation Requirements:**
- **Single request** per operation (no multiple API calls)
- **Standard HTTP methods** (GET, PUT, POST)
- **Configurable timeouts** (should handle requests within configured timeout)
- **Error handling** (return appropriate HTTP status codes)

**Example Backend Service Structure:**
```javascript
// Express.js example
app.get('/api/status', (req, res) => {
  // Return status of all servers in one response
  res.json({
    'server1.example.com': { status: 'primary', health: 'healthy' },
    'server2.example.com': { status: 'secondary', health: 'healthy' }
  });
});

app.put('/api/priority', (req, res) => {
  const { role, server } = req.query; // From params in settings.yml
  // Change server priority logic
  changeServerPriority(server, role);
  res.json({ success: true });
});
```

## 🔐 Authentication Setup

### Local Authentication

Local authentication is enabled by default using the `local-users.yml` file.

### Keycloak SSO Setup

For detailed Keycloak setup instructions, see: [KEYCLOAK_SETUP.md](KEYCLOAK_SETUP.md)

**Quick Keycloak Setup:**

1. **Create Keycloak Client:**
   - Client ID: `dominus-client`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:3001/*`

2. **Update Backend Environment:**
   ```bash
   KEYCLOAK_ENABLED=true
   KEYCLOAK_BASE_URL=https://your-keycloak-server
   KEYCLOAK_REALM=your-realm
   KEYCLOAK_CLIENT_ID=dominus-client
   KEYCLOAK_CLIENT_SECRET=your-client-secret
   ```

## 🏃 Running the Application

### Development Mode

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Production Mode

```bash
# Backend
cd backend
npm start

# Frontend (build and serve)
cd frontend
npm run build
npm run preview
```

### Using Docker

```bash
# Build and run with Docker
docker build -t dominus .
docker run -p 3001:3001 dominus
```

### Using Docker Compose

```bash
# Copy example compose file
cp backend/docker-compose.example.yml docker-compose.yml

# Start services
docker-compose up -d
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Local/Keycloak login |
| POST | `/api/logout` | User logout |
| POST | `/api/refresh-token` | Token refresh |
| GET | `/api/logout-url` | Get logout URL |

### Service Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List all services |
| GET | `/api/service-configs` | Service configurations |
| GET | `/api/statuses` | Service statuses |
| PUT | `/api/priority` | Change server priority |
| PUT | `/api/set-secondary` | Set secondary status |

### Keycloak Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sso/callback` | SSO callback handler |
| POST | `/api/sso/token-callback` | Token processing |
| GET | `/api/keycloak-status` | Keycloak status |
| GET | `/api/keycloak-config` | Frontend config |

## 🏗️ Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMINUS FRONTEND SYSTEM                  │
├─────────────────────────────────────────────────────────────┤
│  Web Interface │ Authentication │ Configuration Manager    │
│  (React App)   │ (Keycloak/Local)│    (settings.yml)       │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP API Calls
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   YOUR BACKEND SERVICES                     │
├─────────────────────────────────────────────────────────────┤
│  dominus-status │ dominus-mongo │ your-custom-service      │
│  (Web Services) │ (MongoDB)     │ (Database/Queue/etc)     │
└─────────────────────────────────────────────────────────────┘
```

### Dominus Frontend Components

```
backend/
├── src/
│   ├── app.js              # Express application
│   ├── server.js           # Server entry point
│   ├── config/             # Configuration management
│   ├── services/           # Business logic
│   │   ├── sessionService.js      # Session management
│   │   ├── keycloakService.js     # Keycloak integration
│   │   ├── localAuthService.js    # Local authentication
│   │   ├── settingsService.js     # Backend service configuration
│   │   └── monitoringService.js   # Backend service communication
│   ├── middleware/         # Express middleware
│   ├── routes/            # API routes
│   └── utils/             # Utility functions
├── tests/                 # Test files
└── public/               # Static files
```

**Architecture Principles:**
- **Frontend-Backend Separation** - Dominus is UI/control layer only
- **HTTP-Based Communication** - Simple REST API calls to backend services  
- **Configuration-Driven** - All backend services configured via `settings.yml`
- **Single Request Pattern** - One HTTP call per operation (status/priority)
- **Stateless Design** - No data persistence, all state in backend services

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── constants/        # Application constants
│   └── styles/           # Styling files
```

**Technologies:**
- **React 18** with hooks
- **Material-UI v5** for components
- **Vite** for development and building
- **Axios** for API communication

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Test Keycloak connectivity
npm run test-keycloak-connectivity

# Test local authentication
npm run test-local admin password

# Test Keycloak authentication
npm run test-keycloak username password

# Test token refresh
npm run test-token-refresh username password

# Test SSO flow
node tests/test-sso-flow.js
```

### Frontend Testing

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔒 Security Features

- **JWT Tokens** with configurable expiration
- **PKCE Flow** for Keycloak OAuth2
- **State Parameter** validation for CSRF protection
- **Secure Headers** and CORS configuration
- **Input Sanitization** for all user inputs
- **Sensitive Data Protection** in logs
- **Token Auto-refresh** mechanism

## 📖 Additional Documentation

- **[Backend Changes Summary](backend/CHANGES_SUMMARY.md)** - Migration guide
- **[Backend Architecture](backend/FINAL_STRUCTURE.md)** - Detailed architecture
- **[Keycloak Setup](KEYCLOAK_SETUP.md)** - SSO configuration guide
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions
- **[Frontend Logging](frontend/LOGGING.md)** - Frontend logging setup
- **[Backend Logging](backend/LOGGING.md)** - Backend logging setup
- **[Progress Bars](frontend/PROGRESS_BARS.md)** - UI progress components

## 🐛 Troubleshooting

### Quick Diagnostics

1. **Check application status:**
   ```bash
   curl http://localhost:3001/api/keycloak-status
   ```

2. **Verify environment variables:**
   ```bash
   cd backend && node -e "console.log(require('./src/config/index.js').config)"
   ```

3. **Check logs for errors:**
   ```bash
   # Backend logs
   cd backend && npm start
   
   # Frontend logs  
   cd frontend && npm run dev
   ```

### Common Issues

- **Port conflicts** - Ensure ports 3000/3001 are available
- **Missing environment files** - Copy from `.example` files
- **Keycloak connectivity** - Verify Keycloak server is running
- **Permission errors** - Check file permissions for config files

### Need Help?

- 📖 **Detailed Guide**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- 🐛 **Report Bug**: [Create Issue](https://github.com/Basyuk/dominus/issues/new?labels=bug&template=bug_report.md)
- ❓ **Ask Question**: [Create Discussion](https://github.com/Basyuk/dominus/discussions/new)
- 💡 **Feature Request**: [Create Issue](https://github.com/Basyuk/dominus/issues/new?labels=enhancement&template=feature_request.md)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs** - [Create Bug Report](https://github.com/Basyuk/dominus/issues/new?labels=bug&template=bug_report.md)
- 💡 **Request Features** - [Create Feature Request](https://github.com/Basyuk/dominus/issues/new?labels=enhancement&template=feature_request.md)
- 📖 **Improve Documentation** - Fix typos, add examples, clarify instructions
- 🔧 **Submit Code Changes** - Bug fixes, new features, performance improvements

### Development Process

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/Basyuk/dominus.git`
3. **Create** feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Test** your changes thoroughly
6. **Commit** with clear message: `git commit -m 'Add amazing feature'`
7. **Push** to your fork: `git push origin feature/amazing-feature`
8. **Submit** a Pull Request

### Code Guidelines

- Follow existing code style and formatting
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic
- Write clear commit messages

For detailed contribution guidelines, see: [CONTRIBUTING.md](CONTRIBUTING.md)

## 🆘 Issues and Support

### Before Creating an Issue

1. **Search existing issues** - Your question might already be answered
2. **Check documentation** - Review README and related docs
3. **Try troubleshooting steps** - Follow the [troubleshooting guide](TROUBLESHOOTING.md)

### Creating Issues

**🐛 Bug Reports**
- Use the [Bug Report Template](https://github.com/Basyuk/dominus/issues/new?labels=bug&template=bug_report.md)
- Include environment details (OS, Node.js version, etc.)
- Provide steps to reproduce
- Include error messages and logs

**💡 Feature Requests**  
- Use the [Feature Request Template](https://github.com/Basyuk/dominus/issues/new?labels=enhancement&template=feature_request.md)
- Explain the use case and expected behavior
- Consider implementation complexity

**❓ Questions**
- Use [GitHub Discussions](https://github.com/Basyuk/dominus/discussions) for questions
- Check [existing discussions](https://github.com/Basyuk/dominus/discussions) first

### Response Times

- **Critical bugs** - Within 24 hours
- **Feature requests** - Within 1 week
- **General questions** - Within 2-3 days

## 🔒 Security

Security is important to us. If you discover a security vulnerability, please [create an issue](https://github.com/Basyuk/dominus/issues/new?labels=security) or contact us directly.

### Security Features

- **JWT Tokens** with configurable expiration
- **PKCE Flow** for Keycloak OAuth2 
- **Input Sanitization** for all user inputs
- **Secure Headers** and CORS configuration
- **Sensitive Data Protection** in logs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### License Summary

- ✅ **Commercial use** - Use in commercial projects
- ✅ **Modification** - Modify the source code
- ✅ **Distribution** - Distribute original or modified version
- ✅ **Private use** - Use privately
- ❌ **Liability** - Authors not liable for damages
- ❌ **Warranty** - No warranty provided

---

## ⭐ Show Your Support

If this project helps you, please consider:
- ⭐ **Star this repository** 
- 🐛 **Report issues** to help improve the project
- 🤝 **Contribute** with code or documentation
- 💬 **Share** with others who might benefit

### 💖 Support Development

This project is developed and maintained in our free time. If **Dominus** has been useful for you, consider supporting its development with cryptocurrency:

**₿ [Donate with Crypto →](https://nowpayments.io/donation/dominus)**
- **100+ cryptocurrencies** supported (Bitcoin, Ethereum, Dogecoin, and more)
- **Credit card to crypto** option available  
- **Anonymous donations** possible
- **Secure and trusted** payment processor

📋 **[See all crypto options and wallet addresses →](CRYPTO_DONATIONS.md)**

Your support helps us:
- 🚀 **Add new features** and improvements
- 🐛 **Fix bugs** quickly
- 📖 **Keep documentation** up to date
- 🎯 **Respond to issues** faster

**Every donation, no matter how small, is greatly appreciated!** 🙏

*⚠️ **Important:** Always verify wallet addresses from [CRYPTO_DONATIONS.md](CRYPTO_DONATIONS.md) before sending. Addresses are regularly updated for security.*

---

**Dominus** - Centralized frontend for server priority management across multiple backend services. 🚀

Configure once in `settings.yml` → Control all your services from one interface.

---

### 💝 Like this project?

If Dominus helped you manage your infrastructure better, consider:
- ⭐ **Starring this repo**
- ₿ **[Crypto donation](https://nowpayments.io/donation/dominus)**
- 📋 **[Direct wallet donation](CRYPTO_DONATIONS.md)**
- 📢 **Sharing with others**

*Made with ❤️ for the DevOps community*

---

### 📊 Project Stats

![GitHub repo size](https://img.shields.io/github/repo-size/Basyuk/dominus)
![GitHub language count](https://img.shields.io/github/languages/count/Basyuk/dominus)
![GitHub top language](https://img.shields.io/github/languages/top/Basyuk/dominus)
![GitHub last commit](https://img.shields.io/github/last-commit/Basyuk/dominus)
