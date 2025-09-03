const jwt = require('jsonwebtoken');
const { config } = require('../config');
const sessionService = require('../services/sessionService');
const keycloakService = require('../services/keycloakService');
const logger = require('../utils/logger');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authorization required' });
  }
  
  logger.debug('authMiddleware: Received auth header', { 
    authHeader: authHeader.substring(0, 30) + '...' 
  });
  logger.debug('authMiddleware: Request path', { path: req.path });
  logger.debug('authMiddleware: Request method', { method: req.method });
  
  // Check if it's Bearer token (Keycloak) or regular token (local authentication)
  if (authHeader.startsWith('Bearer ')) {
    // Keycloak token
    const keycloakToken = authHeader.substring(7);
    logger.debug('authMiddleware: Processing Keycloak token');
    
    try {
      const isValid = await keycloakService.validateToken(keycloakToken);
      if (!isValid) {
        logger.warn('Keycloak token validation failed');
        return res.status(401).json({ success: false, message: 'Invalid or expired Keycloak token' });
      }
      
      // For Keycloak tokens create temporary session
      try {
        const userInfo = await keycloakService.getUserInfo(keycloakToken);
        req.sessionUser = { 
          authMethod: 'keycloak', 
          keycloakToken: keycloakToken,
          username: userInfo.preferred_username || userInfo.username || userInfo.sub,
          email: userInfo.email
        };
        logger.info('Keycloak token valid, proceeding with user', { username: req.sessionUser.username });
      } catch (userInfoError) {
        logger.warn('Failed to get user info, using token only', { error: userInfoError.message });
        req.sessionUser = { 
          authMethod: 'keycloak', 
          keycloakToken: keycloakToken,
          username: 'keycloak_user' // fallback username
        };
      }
      req.authMethod = 'keycloak';
      next();
    } catch (error) {
      logger.error('Keycloak validation error', { error: error.message });
      res.status(401).json({ success: false, message: 'Keycloak token validation error' });
    }
  } else {
    // Local JWT token
    logger.debug('authMiddleware: Processing local JWT token');
    try {
      const decoded = jwt.verify(authHeader, config.auth.jwtSecret);
      const session = sessionService.getSession(authHeader);
      
      logger.debug('authMiddleware: Local token decoded', { authMethod: decoded.authMethod });
      logger.debug('authMiddleware: Session found', !!session);
      
      if (!session) {
        logger.warn('Session not found for local token');
        return res.status(401).json({ success: false, message: 'Session not found' });
      }

      req.sessionUser = session;
      req.authMethod = decoded.authMethod;
      logger.info('Local token valid, proceeding with user', { username: session.username });
      next();
    } catch (error) {
      logger.error('Local token validation error', { error: error.message });
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }
}

module.exports = authMiddleware;
