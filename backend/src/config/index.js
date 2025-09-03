require('dotenv').config();

const config = {
  // Basic server settings
  server: {
    port: process.env.PORT || 3001,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001'
  },

  // Authentication settings
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
    jwtExpiresIn: '12h'
  },

  // Local authentication settings
  localAuth: {
    manageUser: process.env.MANAGE_USER,
    managePassword: process.env.MANAGE_PASSWORD,
    localUsersPath: process.env.LOCAL_USERS_PATH || './local-users.yml'
  },

  // Keycloak settings
  keycloak: {
    enabled: process.env.KEYCLOAK_ENABLED === 'true',
    baseUrl: process.env.KEYCLOAK_BASE_URL,
    realm: process.env.KEYCLOAK_REALM,
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    redirectUri: process.env.KEYCLOAK_REDIRECT_URI
  },

  // File settings
  files: {
    settingsPath: process.env.SETTINGS_PATH || './settings.yml'
  }
};

// Configuration validation
function validateConfig() {
  const errors = [];

  if (config.keycloak.enabled) {
    if (!config.keycloak.baseUrl) errors.push('KEYCLOAK_BASE_URL not set');
    if (!config.keycloak.realm) errors.push('KEYCLOAK_REALM not set');
    if (!config.keycloak.clientId) errors.push('KEYCLOAK_CLIENT_ID not set');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`);
  }
}

module.exports = {
  config,
  validateConfig
};

