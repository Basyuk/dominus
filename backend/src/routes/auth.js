const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const sessionService = require('../services/sessionService');
const keycloakService = require('../services/keycloakService');
const localAuthService = require('../services/localAuthService');
const logger = require('../utils/logger');

// Local authentication
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    let authResult = null;
    let authMethod = null;

    // Try local authorization
    try {
      localAuthService.authenticateUser(username, password);
      authResult = { username, password };
      authMethod = 'local';
    } catch (localError) {
      return res.status(401).json({ success: false, message: localError.message });
    }

    if (!authResult) {
      return res.status(401).json({ success: false, message: 'Authentication failed' });
    }

    // Create session
    const sessionToken = sessionService.createSession({
      username,
      authMethod,
      password: authMethod === 'local' ? password : null
    });

    res.json({ 
      success: true, 
      token: sessionToken,
      authMethod
    });

  } catch (error) {
    logger.error('Authentication error', { error });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const session = req.sessionUser;
    logger.debug('Logout: session user', { session });
    logger.debug('Logout: auth method', { authMethod: req.authMethod });
    
    if (session.authMethod === 'keycloak' && session.keycloakRefreshToken) {
      // Keycloak logout
      try {
        await keycloakService.logout(session.keycloakRefreshToken);
        logger.info('Successful Keycloak logout for user', { username: session.username });
      } catch (logoutError) {
        logger.error('Keycloak logout error', { error: logoutError.message });
        // Don't return error as local session should be deleted anyway
      }
    }
    
    // Delete local session
    const sessionToken = req.headers['authorization'];
    if (sessionToken) {
      sessionService.deleteSession(sessionToken);
    }
    
    res.json({ 
      success: true, 
      message: 'Logout successful',
      authMethod: session.authMethod
    });
  } catch (error) {
    logger.error('Logout error', { error });
    res.status(500).json({ success: false, message: 'Logout error' });
  }
});

// Keycloak token refresh
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const newTokenData = await keycloakService.refreshToken(refreshToken);
    
    // Update token in session if it exists
    const sessionToken = req.headers['authorization'];
    if (sessionToken) {
      sessionService.updateKeycloakToken(sessionToken, newTokenData);
    }

    res.json({
      success: true,
      access_token: newTokenData.access_token,
      refresh_token: newTokenData.refresh_token,
      expires_in: newTokenData.expires_in
    });
  } catch (error) {
    logger.error('Token refresh error', { error: error.message });
    res.status(401).json({ success: false, message: 'Failed to refresh token' });
  }
});

// Get logout URL
router.get('/logout-url', authMiddleware, (req, res) => {
  try {
    const session = req.sessionUser;
    
    if (session.authMethod === 'keycloak') {
      const postLogoutRedirectUri = req.query.redirect_uri;
      const logoutUrl = keycloakService.getLogoutUrl(postLogoutRedirectUri);
      
      res.json({ 
        success: true, 
        logoutUrl,
        authMethod: 'keycloak'
      });
    } else {
      res.json({ 
        success: true, 
        logoutUrl: null,
        authMethod: 'local'
      });
    }
  } catch (error) {
    logger.error('Error getting logout URL', { error });
    res.status(500).json({ success: false, message: 'Error getting logout URL' });
  }
});

module.exports = router;
