const app = require('./app');
const { config, validateConfig } = require('./config');
const logger = require('./utils/logger');

// Configuration validation at startup
try {
  validateConfig();
  logger.info('✅ Configuration is valid');
} catch (error) {
  logger.error('❌ Configuration error:', error.message);
  process.exit(1);
}

// Log Keycloak settings at startup
if (config.keycloak.enabled) {
  logger.info('=== Keycloak Settings ===');
  logger.info('Keycloak enabled', { enabled: config.keycloak.enabled });
  logger.secure('Keycloak base URL', { baseUrl: config.keycloak.baseUrl });
  logger.info('Keycloak realm', { realm: config.keycloak.realm });
  logger.info('Keycloak client ID', { clientId: config.keycloak.clientId });
  logger.secure('Keycloak client secret', { 
    hasSecret: !!config.keycloak.clientSecret,
    secretType: config.keycloak.clientSecret ? 'confidential' : 'public'
  });
  logger.info('✅ Keycloak settings are correct');
  logger.info('========================');
}

// Server startup
const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info(`🚀 Backend started on port ${PORT}`);
  logger.info('📊 Logging configuration', logger.getConfig());
  logger.info('🌐 Frontend URL', { frontendUrl: config.server.frontendUrl });
});
