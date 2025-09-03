#!/bin/bash

echo "Installing dependencies for infrastructure monitoring..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Installation completed!"
echo ""
echo "Next steps:"
echo "1. Copy backend/env.example to backend/.env"
echo "2. Configure environment variables in backend/.env"
echo "3. Copy backend/local-users.example.yml to backend/local-users.yml"
echo "4. Configure local users in backend/local-users.yml"
echo "5. Copy backend/settings.example.yml to backend/settings.yml"
echo "6. Configure services in backend/settings.yml"
echo "7. Start backend: cd backend && npm start"
echo "8. Start frontend: cd frontend && npm run dev"