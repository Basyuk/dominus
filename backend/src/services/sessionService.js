const jwt = require('jsonwebtoken');
const { config } = require('../config');
const logger = require('../utils/logger');

class SessionService {
  constructor() {
    this.sessions = {};
  }

  // Create new session
  createSession(userData) {
    const { username, authMethod, keycloakToken, keycloakRefreshToken, keycloakExpiresIn } = userData;
    
    const sessionToken = jwt.sign({ 
      username, 
      authMethod,
      keycloakToken
    }, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiresIn });

    this.sessions[sessionToken] = { 
      username, 
      password: authMethod === 'local' ? userData.password : null,
      authMethod,
      keycloakToken,
      keycloakRefreshToken,
      keycloakExpiresIn,
      keycloakExpiresAt: keycloakExpiresIn ? Date.now() + (keycloakExpiresIn * 1000) : null
    };

    logger.info('Session created', { username, authMethod });
    return sessionToken;
  }

  // Get session by token
  getSession(sessionToken) {
    return this.sessions[sessionToken];
  }

  // Delete session
  deleteSession(sessionToken) {
    if (this.sessions[sessionToken]) {
      const session = this.sessions[sessionToken];
      logger.info('Session deleted', { username: session.username, authMethod: session.authMethod });
      delete this.sessions[sessionToken];
      return true;
    }
    return false;
  }

  // Update Keycloak token in session
  updateKeycloakToken(sessionToken, newTokenData) {
    const session = this.sessions[sessionToken];
    if (session && session.authMethod === 'keycloak') {
      session.keycloakToken = newTokenData.access_token;
      session.keycloakRefreshToken = newTokenData.refresh_token;
      session.keycloakExpiresIn = newTokenData.expires_in;
      session.keycloakExpiresAt = Date.now() + (newTokenData.expires_in * 1000);
      
      logger.info('Keycloak token updated in session', { username: session.username });
      return true;
    }
    return false;
  }

  // Check token expiration
  isTokenExpired(sessionToken) {
    const session = this.sessions[sessionToken];
    if (session && session.keycloakExpiresAt) {
      const now = Date.now();
      return now >= session.keycloakExpiresAt - 60000; // One minute before expiration
    }
    return false;
  }

  // Get all active sessions (for debugging)
  getAllSessions() {
    return Object.keys(this.sessions);
  }
}

module.exports = new SessionService();
