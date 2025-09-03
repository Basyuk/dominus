#!/bin/bash

# Script for setting up logging system

echo "🔧 Setting up logging system..."

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Creating backup copy..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create .env file with logging settings
cat > .env << EOF
# Logging configuration
# Logging levels: ERROR, WARN, INFO, DEBUG, TRACE
VITE_LOG_LEVEL=INFO

# Enable/disable logging (true/false)
VITE_ENABLE_LOGGING=true

# Frontend URL for SSO
VITE_FRONTEND_URL=http://localhost:3001
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
echo "🔧 To change logging level edit VITE_LOG_LEVEL in .env file"
echo "🚫 To disable logging set VITE_ENABLE_LOGGING=false"
echo ""
echo "📖 Detailed documentation: LOGGING.md"

