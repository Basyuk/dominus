import { APP_CONFIG, AUTH_CONFIG, ERROR_MESSAGES } from '../constants';

// Utilities for working with SSO (Keycloak)
export class SSOUtils {
  // Generate random state for OAuth2 security
  static generateState() {
    return crypto.randomUUID();
  }

  // Create authorization URL for Keycloak
  static createAuthUrl(keycloakConfig, state) {
    const { baseUrl, realm, clientId } = keycloakConfig;
    const redirectUri = APP_CONFIG.FRONTEND_URL;
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      scope: 'openid',
      redirect_uri: redirectUri,
      state: state,
      prompt: 'login',
    });

    return `${baseUrl}/realms/${realm}/protocol/openid-connect/auth?${params.toString()}`;
  }

  // Validate callback parameters
  static validateCallbackParams(urlParams) {
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      throw new Error(errorDescription || `SSO error: ${error}`);
    }

    if (!code || !state) {
      throw new Error('Missing required callback parameters');
    }

    return { code, state };
  }

  // Validate state parameter
  static validateState(receivedState, savedState) {
    if (receivedState !== savedState) {
      throw new Error(ERROR_MESSAGES.INVALID_STATE);
    }
  }

  // Handle logout callback
  static handleLogoutCallback(urlParams) {
    const logout = urlParams.get('logout');
    
    if (logout === 'true') {
      // Clear all authentication data
      Object.values(AUTH_CONFIG.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear URL from parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return true; // Indicate that logout occurred
    }
    
    return false;
  }

  // Get parameters from URL
  static getUrlParams() {
    return new URLSearchParams(window.location.search);
  }

  // Clear URL from parameters
  static clearUrlParams() {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Check if current URL is callback
  static isCallbackUrl() {
    const urlParams = this.getUrlParams();
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const logout = urlParams.get('logout');
    
    return !!(code && state) || logout === 'true';
  }

  // Get authentication method information
  static getAuthMethodInfo() {
    const authMethod = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_METHOD);
    
    switch (authMethod) {
      case AUTH_CONFIG.METHODS.KEYCLOAK:
        return { method: 'Keycloak', displayName: 'Keycloak' };
      case AUTH_CONFIG.METHODS.LOCAL:
      default:
        return { method: 'local', displayName: 'Local' };
    }
  }
} 