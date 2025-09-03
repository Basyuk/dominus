import { API_ENDPOINTS, AUTH_CONFIG, ERROR_MESSAGES } from '../constants';
import { logInfo, logError, logDebug, logSecure } from './logger';

// Simple error handling functions
const createError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const handleApiError = (error, defaultMessage) => {
  return error.message || defaultMessage;
};

const logErrorWithContext = (error, context) => {
  logError(`Application error: ${error.message}`, {
    code: error.code,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  });
};

// Base class for API operations
class ApiService {
  constructor() {
    this.baseUrl = '/api';
  }

  // Base method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    logDebug('API request', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      hasBody: !!config.body,
      body: config.body
    });

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Clear tokens on 401 error (authorization problems)
        this.clearAuthData();
        logSecure('401 error received - clearing tokens');
        throw createError(ERROR_MESSAGES.INVALID_CREDENTIALS, 'AUTH_ERROR');
      }
      
      if (response.status === 403) {
        // Try to get error message from server for 403 error
        let errorMessage = ERROR_MESSAGES.NO_PERMISSIONS;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If JSON parsing failed, use standard message
        }
        
        logSecure('403 error received', { errorMessage });
        throw createError(errorMessage, 'PERMISSION_ERROR');
      }

      if (!response.ok) {
        // Log error details
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
          logError('API Error Response', {
            status: response.status,
            url: response.url,
            errorData: errorData
          });
        } catch (e) {
          logError('API Error Response (no JSON)', {
            status: response.status,
            url: response.url,
            statusText: response.statusText
          });
        }
        throw createError(`HTTP error! status: ${response.status}`, 'HTTP_ERROR');
      }

      return await response.json();
    } catch (error) {
      logErrorWithContext(error, `API request to ${endpoint}`);
      
      if (error.code === 'AUTH_ERROR' || error.code === 'PERMISSION_ERROR') {
        throw error;
      }
      
      throw createError(handleApiError(error, ERROR_MESSAGES.CONNECTION_ERROR), 'API_ERROR');
    }
  }

  // Authentication methods
  async login(credentials) {
    return this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(token) {
    const authMethod = localStorage.getItem('authMethod');
    
    // For Keycloak use keycloakToken, for local authentication use regular token
    let authHeader;
    if (authMethod === 'keycloak') {
      const keycloakToken = localStorage.getItem('keycloakToken');
      authHeader = keycloakToken ? `Bearer ${keycloakToken}` : `Bearer ${token}`;
    } else {
      authHeader = token;
    }
    
    return this.request(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
    });
  }

  async getKeycloakConfig() {
    return this.request(API_ENDPOINTS.KEYCLOAK_CONFIG);
  }

  async ssoTokenCallback(accessToken, codeVerifier) {
    return this.request(API_ENDPOINTS.SSO_TOKEN_CALLBACK, {
      method: 'POST',
      body: JSON.stringify({ 
        access_token: accessToken,
        code_verifier: codeVerifier 
      }),
    });
  }

  async getLogoutUrl(token, redirectUri) {
    const authMethod = localStorage.getItem('authMethod');
    
    // For Keycloak use keycloakToken, for local authentication use regular token
    let authHeader;
    if (authMethod === 'keycloak') {
      const keycloakToken = localStorage.getItem('keycloakToken');
      authHeader = keycloakToken ? `Bearer ${keycloakToken}` : `Bearer ${token}`;
    } else {
      authHeader = token;
    }
    
    return this.request(`${API_ENDPOINTS.LOGOUT_URL}?redirect_uri=${encodeURIComponent(redirectUri)}`, {
      headers: {
        'Authorization': authHeader,
      },
    });
  }

  // Service management methods
  async getServices(token, authMethod) {
    logSecure('getServices called', { 
      hasToken: !!token, 
      authMethod,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'Missing'
    });
    
    // For Keycloak use keycloakToken, for local authentication use regular token
    let authHeader;
    if (authMethod === 'keycloak') {
      const keycloakToken = localStorage.getItem('keycloakToken');
      authHeader = keycloakToken ? `Bearer ${keycloakToken}` : `Bearer ${token}`;
      logDebug('Using Keycloak auth', { 
        hasKeycloakToken: !!keycloakToken,
        tokenPreview: keycloakToken ? keycloakToken.substring(0, 20) + '...' : 'Missing'
      });
    } else {
      authHeader = token;
      logDebug('Using local auth', { 
        tokenPreview: token ? token.substring(0, 20) + '...' : 'Missing'
      });
    }
    
    logDebug('Final auth header', { 
      hasAuthHeader: !!authHeader,
      headerPreview: authHeader ? authHeader.substring(0, 30) + '...' : 'Missing'
    });
    
    return this.request(API_ENDPOINTS.SERVICES, {
      headers: {
        'Authorization': authHeader,
      },
    });
  }

  async getStatuses(token, authMethod) {
    logSecure('getStatuses called', { 
      hasToken: !!token, 
      authMethod,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'Missing'
    });
    
    // For Keycloak use keycloakToken, for local authentication use regular token
    let authHeader;
    if (authMethod === 'keycloak') {
      const keycloakToken = localStorage.getItem('keycloakToken');
      authHeader = keycloakToken ? `Bearer ${keycloakToken}` : `Bearer ${token}`;
      logDebug('getStatuses: Using Keycloak auth', { 
        hasKeycloakToken: !!keycloakToken,
        tokenPreview: keycloakToken ? keycloakToken.substring(0, 20) + '...' : 'Missing'
      });
    } else {
      authHeader = token;
      logDebug('getStatuses: Using local auth', { 
        tokenPreview: token ? token.substring(0, 20) + '...' : 'Missing'
      });
    }
    
    logDebug('getStatuses: Final auth header', { 
      hasAuthHeader: !!authHeader,
      headerPreview: authHeader ? authHeader.substring(0, 30) + '...' : 'Missing'
    });
    
    return this.request(API_ENDPOINTS.STATUSES, {
      headers: {
        'Authorization': authHeader,
      },
    });
  }

  async getServiceConfigs(token, authMethod) {
    logInfo('getServiceConfigs called', { authMethod });
    
    // For Keycloak use keycloakToken, for local authentication use regular token
    let authHeader;
    if (authMethod === 'keycloak') {
      const keycloakToken = localStorage.getItem('keycloakToken');
      authHeader = keycloakToken ? `Bearer ${keycloakToken}` : `Bearer ${token}`;
    } else {
      authHeader = token;
    }
    
    return this.request(API_ENDPOINTS.SERVICE_CONFIGS, {
      headers: {
        'Authorization': authHeader,
      },
    });
  }

  async updatePriority(token, service, url, authMethod) {
    logInfo('updatePriority called', { service, url, authMethod });
    
    // For Keycloak use keycloakToken, for local authentication use regular token
    let authHeader;
    if (authMethod === 'keycloak') {
      const keycloakToken = localStorage.getItem('keycloakToken');
      authHeader = keycloakToken ? `Bearer ${keycloakToken}` : `Bearer ${token}`;
    } else {
      authHeader = token;
    }
    
    const requestBody = { service, url };
    logDebug('updatePriority request', { 
      body: requestBody,
      hasAuthHeader: !!authHeader,
      headerPreview: authHeader ? authHeader.substring(0, 30) + '...' : 'Missing'
    });
    
    return this.request(API_ENDPOINTS.PRIORITY, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
      },
      body: JSON.stringify(requestBody),
    });
  }

  async setSecondary(token, service, url, authMethod) {
    logInfo('setSecondary called', { service, url, authMethod });
    
    // For Keycloak use keycloakToken, for local authentication use regular token
    let authHeader;
    if (authMethod === 'keycloak') {
      const keycloakToken = localStorage.getItem('keycloakToken');
      authHeader = keycloakToken ? `Bearer ${keycloakToken}` : `Bearer ${token}`;
    } else {
      authHeader = token;
    }
    
    const requestBody = { service, url };
    logDebug('setSecondary request', { 
      body: requestBody,
      hasAuthHeader: !!authHeader,
      headerPreview: authHeader ? authHeader.substring(0, 30) + '...' : 'Missing'
    });
    
    return this.request(API_ENDPOINTS.SET_SECONDARY, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
      },
      body: JSON.stringify(requestBody),
    });
  }

  // Token utilities
  saveAuthData(data) {
    const { token, authMethod, keycloakToken, keycloakRefreshToken } = data;
    
    if (token) {
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, token);
      logSecure('Token saved', { tokenPreview: token.substring(0, 20) + '...' });
    }
    if (authMethod) localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_METHOD, authMethod);
    if (keycloakToken) localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.KEYCLOAK_TOKEN, keycloakToken);
    if (keycloakRefreshToken) localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.KEYCLOAK_REFRESH_TOKEN, keycloakRefreshToken);
  }

  clearAuthData() {
    Object.values(AUTH_CONFIG.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    logInfo('Auth data cleared');
  }

  getAuthData() {
    return {
      token: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN),
      authMethod: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_METHOD),
      keycloakToken: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.KEYCLOAK_TOKEN),
      keycloakRefreshToken: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.KEYCLOAK_REFRESH_TOKEN),
    };
  }

  saveOAuthState(state) {
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.OAUTH_STATE, state);
  }

  getOAuthState() {
    return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.OAUTH_STATE);
  }

  clearOAuthState() {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.OAUTH_STATE);
  }
}

// Create API service instance
export const apiService = new ApiService();

// Export individual methods for backward compatibility
export const {
  login,
  logout,
  getKeycloakConfig,
  ssoTokenCallback,
  getLogoutUrl,
  getServices,
  getStatuses,
  updatePriority,
  saveAuthData,
  clearAuthData,
  getAuthData,
  saveOAuthState,
  getOAuthState,
  clearOAuthState,
} = apiService; 