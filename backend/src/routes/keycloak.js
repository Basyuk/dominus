const express = require('express');
const router = express.Router();
const sessionService = require('../services/sessionService');
const keycloakService = require('../services/keycloakService');
const logger = require('../utils/logger');

// Endpoint for receiving callback from SSO (authorization code flow)
router.post('/sso/callback', async (req, res) => {
  await handleSSOCallback(req, res);
});

router.get('/sso/callback', async (req, res) => {
  await handleSSOCallback(req, res);
});

// Endpoint for processing token from frontend (with PKCE support)
router.post('/sso/token-callback', async (req, res) => {
  const { access_token, code_verifier } = req.body;
  
  logger.debug('Received token callback from frontend', { 
    accessToken: access_token ? access_token.substring(0, 10) + '...' : 'null', 
    codeVerifier: code_verifier ? 'present' : 'missing'
  });

  try {
    if (!access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing access_token' 
      });
    }

    // Get user information from token
    const userInfo = await keycloakService.getUserInfo(access_token);
    
    logger.info('Successful Keycloak authentication for user', { username: userInfo.preferred_username });

    // Create session
    const sessionToken = sessionService.createSession({
      username: userInfo.preferred_username,
      authMethod: 'keycloak',
      keycloakToken: access_token,
      keycloakRefreshToken: null, // Refresh token not provided in this case
      keycloakExpiresIn: null
    });

    res.json({ 
      success: true, 
      token: sessionToken,
      authMethod: 'keycloak',
      keycloakToken: access_token,
      keycloakRefreshToken: null
    });

  } catch (error) {
    logger.error('Error processing token callback', { error });
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Token callback processing error' 
    });
  }
});

async function handleSSOCallback(req, res) {
  // Get parameters from request body or query parameters
  const code = req.body.code || req.query.code;
  const state = req.body.state || req.query.state;
  const code_verifier = req.body.code_verifier || req.query.code_verifier;
  const redirect_uri = req.body.redirect_uri || req.query.redirect_uri || 'http://localhost:3001';

  logger.debug('Received SSO callback (code flow)', { 
    code: code ? code.substring(0, 10) + '...' : 'null', 
    state, 
    codeVerifier: code_verifier ? 'present' : 'missing', 
    redirectUri: redirect_uri, 
    source: req.body.code ? 'body' : 'query'
  });

  try {
    if (!code || !state) {
      logger.debug('Error: missing required parameters');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters code or state' 
      });
    }

    // Exchange code for token with PKCE
    const tokenData = await keycloakService.exchangeCodeForToken(code, redirect_uri, code_verifier);
    
    // Get user information from token
    const userInfo = await keycloakService.getUserInfo(tokenData.access_token);
    
    logger.info('Successful Keycloak authentication for user', { username: userInfo.preferred_username });

    // Create session
    const sessionToken = sessionService.createSession({
      username: userInfo.preferred_username,
      authMethod: 'keycloak',
      keycloakToken: tokenData.access_token,
      keycloakRefreshToken: tokenData.refresh_token,
      keycloakExpiresIn: tokenData.expires_in
    });

    res.json({ 
      success: true, 
      token: sessionToken,
      authMethod: 'keycloak',
      keycloakToken: tokenData.access_token,
      keycloakRefreshToken: tokenData.refresh_token
    });

  } catch (error) {
    logger.error('Error processing SSO callback', { error });
    res.status(500).json({ 
      success: false, 
      message: error.message || 'SSO callback processing error' 
    });
  }
}

// Endpoint for Keycloak settings diagnostics
router.get('/keycloak-status', (req, res) => {
  try {
    const status = keycloakService.getStatus();
    
    res.json({ 
      success: true, 
      keycloak: status
    });
  } catch (error) {
    logger.error('Error getting Keycloak status', { error });
    res.status(500).json({ success: false, message: 'Error getting Keycloak status' });
  }
});

// Endpoint for getting Keycloak settings for frontend
router.get('/keycloak-config', (req, res) => {
  try {
    const config = keycloakService.getFrontendConfig();
    
    res.json({ 
      success: true, 
      config
    });
  } catch (error) {
    logger.error('Error getting Keycloak config', { error });
    res.status(500).json({ success: false, message: 'Error getting Keycloak configuration' });
  }
});

module.exports = router;