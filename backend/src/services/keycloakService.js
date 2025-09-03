const axios = require('axios');
const { config } = require('../config');
const logger = require('../utils/logger');

class KeycloakService {
  constructor() {
    this.config = config.keycloak;
  }

  // Get token by username and password
  async getToken(username, password) {
    if (!this.config.enabled) {
      throw new Error('Keycloak is not configured');
    }

    const tokenUrl = `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/token`;
    
    logger.debug('Requesting Keycloak token', { 
      username, 
      tokenUrl,
      realm: this.config.realm,
      clientId: this.config.clientId
    });
    
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      username: username,
      password: password
    });

    try {
      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      logger.secure('Keycloak token received', {
        hasAccessToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refresh_token,
        expiresIn: response.data.expires_in
      });

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in
      };
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logger.warn('Keycloak authentication failed', { 
          username, 
          status: error.response.status 
        });
        throw new Error('Invalid username or password in Keycloak');
      }
      logger.error('Keycloak authentication error', { 
        username, 
        error: error.message,
        status: error.response?.status 
      });
      throw new Error(`Keycloak authentication error: ${error.message}`);
    }
  }

  // Token validation
  async validateToken(token) {
    if (!this.config.enabled) {
      return false;
    }

    const introspectUrl = `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/token/introspect`;
    
    logger.debug('Validating Keycloak token', { introspectUrl });
    
    const params = new URLSearchParams({
      token: token,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    });

    try {
      const response = await axios.post(introspectUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 5000
      });

      return response.data.active === true;
    } catch (error) {
      logger.error('Keycloak token introspection error', { error: error.message });
      return false;
    }
  }

  // Get user information
  async getUserInfo(token) {
    if (!this.config.enabled) {
      throw new Error('Keycloak is not configured');
    }

    const userInfoUrl = `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/userinfo`;
    
    logger.debug('Requesting Keycloak user info', { userInfoUrl });
    
    try {
      const response = await axios.get(userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });

      logger.info('Keycloak user info received', { username: response.data.preferred_username });
      return response.data;
    } catch (error) {
      logger.error('Keycloak user info error', { error: error.response?.data || error.message });
      throw new Error('Failed to get user information');
    }
  }

  // Exchange authorization code for token
  async exchangeCodeForToken(code, redirectUri, codeVerifier = null) {
    if (!this.config.enabled) {
      throw new Error('Keycloak is not configured');
    }

    logger.debug('Exchange code for token', { 
      code, 
      redirectUri, 
      clientId: this.config.clientId,
      hasClientSecret: !!this.config.clientSecret
    });

    if (!this.config.clientSecret) {
      logger.error('Keycloak client secret not set for authorization code flow');
      throw new Error('KEYCLOAK_CLIENT_SECRET not set. For Authorization Code Flow, a confidential client with client_secret is required.');
    }
    
    const tokenUrl = `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code: code,
      redirect_uri: redirectUri
    });

    if (codeVerifier) {
      params.append('code_verifier', codeVerifier);
      logger.debug('PKCE code_verifier added');
    }

    try {
      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      logger.info('Successful Keycloak token exchange response', { 
        status: response.status, 
        statusText: response.statusText, 
        responseDataKeys: Object.keys(response.data || {}) 
      });
      
      return response.data;
    } catch (error) {
      logger.error('Keycloak token exchange error', { 
        errorType: error.constructor.name, 
        errorMessage: error.message, 
        errorCode: error.code, 
        errorResponseExists: !!error.response, 
        errorResponseStatus: error.response?.status, 
        errorResponseStatusText: error.response?.statusText, 
        errorResponseData: error.response?.data 
      });
      
      if (error.response?.data?.error) {
        throw new Error(`Keycloak error: ${error.response.data.error} - ${error.response.data.error_description || ''}`);
      } else {
        throw new Error(`Error exchanging authorization code for token: ${error.message}`);
      }
    }
  }

  // Token refresh
  async refreshToken(refreshToken) {
    if (!this.config.enabled) {
      throw new Error('Keycloak is not configured');
    }

    const tokenUrl = `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken
    });

    try {
      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      logger.error('Keycloak token refresh error', { error: error.message });
      throw new Error('Failed to refresh token');
    }
  }

  // Logout
  async logout(refreshToken) {
    if (!this.config.enabled) {
      return;
    }

    const logoutUrl = `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/logout?` +
      `client_id=${encodeURIComponent(this.config.clientId)}` +
      `&post_logout_redirect_uri=${encodeURIComponent(config.server.frontendUrl)}`;
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken
    });

    try {
      await axios.post(logoutUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });
      logger.info('Successful Keycloak logout');
    } catch (error) {
      logger.error('Keycloak logout error', { error: error.message });
      throw error;
    }
  }

  // Get logout URL
  getLogoutUrl(redirectUri = null) {
    if (!this.config.enabled) {
      return null;
    }

    const postLogoutRedirectUri = redirectUri || config.server.frontendUrl;
    
    return `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/logout?` +
      `client_id=${encodeURIComponent(this.config.clientId)}` +
      `&post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
  }

  // Get configuration status
  getStatus() {
    return {
      enabled: this.config.enabled,
      baseUrl: this.config.baseUrl,
      realm: this.config.realm,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret ? '***SET***' : '***NOT SET***',
      tokenUrl: this.config.enabled ? `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/token` : null,
      userInfoUrl: this.config.enabled ? `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/userinfo` : null
    };
  }

  // Get configuration for frontend
  getFrontendConfig() {
    if (!this.config.enabled) {
      return { enabled: false };
    }
    
    return {
      enabled: true,
      baseUrl: this.config.baseUrl,
      realm: this.config.realm,
      clientId: this.config.clientId
    };
  }
}

module.exports = new KeycloakService();
