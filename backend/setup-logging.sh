#!/bin/bash

# Script for setting up backend logging system

echo "🔧 Setting up backend logging system..."

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Creating backup copy..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create .env file with logging settings
cat > .env << EOF
# Basic settings
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
SETTINGS_PATH=./settings.yml

# Frontend URL (for logout redirect)
FRONTEND_URL=http://localhost:3001

# Local users
MANAGE_USER=admin
MANAGE_PASSWORD=admin-password
LOCAL_USERS_PATH=./local-users.yml

# Keycloak settings (backend only)
KEYCLOAK_ENABLED=true
KEYCLOAK_BASE_URL=https://your-keycloak-server/auth
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret

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
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📋 Available logging levels:"
echo "  ERROR  - errors only"
echo "  WARN   - warnings and errors"
echo "  INFO   - informational messages (default)"
echo "  DEBUG  - debug information"
echo "  TRACE  - detailed debug information"
echo ""
echo "📤 Log output methods:"
echo "  stdout - console only (recommended for Docker)"
echo "  file   - file only"
echo "  both   - both console and file"
echo ""
echo "📁 File logging settings (with LOG_OUTPUT=file or both):"
echo "  LOG_DIR=./logs          - directory for logs"
echo "  LOG_FILE=app.log        - log file name"
echo "  LOG_MAX_SIZE=10MB       - maximum file size"
echo "  LOG_MAX_FILES=5         - number of rotation files"
echo ""
echo "🔧 To change settings, edit variables in .env file"
echo "🚫 To disable logging set ENABLE_LOGGING=false"
echo ""
echo "🐳 For Docker it's recommended to use LOG_OUTPUT=stdout"
echo ""
echo "📖 Detailed documentation: LOGGING.md"
