# Frontend build
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
COPY frontend/ .
RUN npm install && npm run build

# Backend build and run
FROM node:20-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ .
COPY --from=frontend-build /app/frontend/dist ./public
COPY backend/.env ./
COPY backend/settings.yml ./
EXPOSE 3001
CMD ["node", "src/server.js"]