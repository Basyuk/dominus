// Application constants
export const APP_CONFIG = {
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3001',
  API_BASE_URL: '/api',
};

// Authentication constants
export const AUTH_CONFIG = {
  STORAGE_KEYS: {
    TOKEN: 'token',
    AUTH_METHOD: 'authMethod',
    KEYCLOAK_TOKEN: 'keycloakToken',
    KEYCLOAK_REFRESH_TOKEN: 'keycloakRefreshToken',
    OAUTH_STATE: 'oauth_state',
  },
  METHODS: {
    LOCAL: 'local',
    KEYCLOAK: 'keycloak',
  },
};

// API endpoints constants
export const API_ENDPOINTS = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  KEYCLOAK_CONFIG: '/keycloak-config',
  SSO_TOKEN_CALLBACK: '/sso/token-callback',
  LOGOUT_URL: '/logout-url',
  SERVICES: '/services',
  STATUSES: '/statuses',
  PRIORITY: '/priority',
  SERVICE_CONFIGS: '/service-configs',
  SET_SECONDARY: '/set-secondary',
};

// Service status constants
export const SERVICE_STATUS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  UNKNOWN: 'unknown',
};

// UI constants
export const UI_CONFIG = {
  LOGO_SIZE: {
    LOGIN: { width: '50px', height: '50px' },
    HEADER: { width: '50px', height: '50px' },
  },
  TABLE_CONFIG: {
    MAX_WIDTH: 900,
    ROW_SPAN_BORDER: '3px solid #1976d2',
  },
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  NO_PERMISSIONS: 'No management permissions',
  CONNECTION_ERROR: 'Server connection error',
  SSO_NOT_CONFIGURED: 'SSO is not configured or disabled',
  SSO_CONNECTION_ERROR: 'SSO server connection error',
  SERVICES_LOAD_ERROR: 'Error loading services',
  STATUSES_LOAD_ERROR: 'Error loading statuses',
  PRIORITY_CHANGE_ERROR: 'Error changing primary server',
  BULK_UPDATE_ERROR: 'Bulk update error',
  INVALID_STATE: 'Invalid state parameter',
  AUTH_ERROR: 'Authorization error',
  CALLBACK_ERROR: 'Callback processing error',
  LOGOUT_ERROR: 'Logout error',
};

// User messages
export const USER_MESSAGES = {
  LOGIN_LOADING: 'Logging in...',
  SSO_REDIRECT: 'Redirecting to SSO...',
  LOGIN_BUTTON: 'Login',
  SSO_LOGIN_BUTTON: 'Login with SSO',
  REFRESH_STATUSES: 'Refresh Statuses',
  BULK_EDIT: 'Bulk Edit',
  APPLY: 'Apply',
  CANCEL: 'Cancel',
  SELECT_ALL: 'Select All',
  LOGOUT: 'Logout',
  MAKE_PRIMARY: 'Make Primary',
  MAKE_SECONDARY: 'Make Secondary',
  INFRASTRUCTURE_MANAGEMENT: 'Infrastructure Management',
  AUTH_METHOD: 'Authentication:',
  FILTER_PLACEHOLDER: 'Filter by service, name or status',
}; 