const axios = require('axios');
const settingsService = require('./settingsService');
const sessionService = require('./sessionService');
const keycloakService = require('./keycloakService');
const logger = require('../utils/logger');

class MonitoringService {
  // Create auth headers for API requests
  async createAuthHeaders(session) {
    if (session.authMethod === 'keycloak' && session.keycloakToken) {
      // Check if token has expired
      if (session.keycloakExpiresIn && session.keycloakExpiresAt) {
        const now = Date.now();
        if (now >= session.keycloakExpiresAt - 60000) { // Refresh one minute before expiration
          try {
            const newTokenData = await keycloakService.refreshToken(session.keycloakRefreshToken);
            sessionService.updateKeycloakToken(session.keycloakToken, newTokenData);
            session.keycloakToken = newTokenData.access_token;
          } catch (error) {
            logger.error('Keycloak token refresh error', { error: error.message });
          }
        }
      }
      
      return {
        'Authorization': `Bearer ${session.keycloakToken}`
      };
    } else if (session.authMethod === 'local' && session.username && session.password) {
      return {
        'Authorization': `Basic ${Buffer.from(`${session.username}:${session.password}`).toString('base64')}`
      };
    }
    
    return {};
  }

  // Get statuses of all services
  async getServiceStatuses(session) {
    try {
      const legacyData = settingsService.getLegacySettings();
      const result = {};
      
      for (const [service, servers] of Object.entries(legacyData)) {
        result[service] = await Promise.all(servers.map(async (server) => {
          try {
            const authHeaders = await this.createAuthHeaders(session);
            const statusConfig = server.status;
            const config = {
              timeout: statusConfig.timeout || 2000,
              headers: authHeaders
            };
            
            let resp;
            if (statusConfig.method === 'POST') {
              resp = await axios.post(statusConfig.url, statusConfig.body || {}, config);
            } else if (statusConfig.method === 'PUT') {
              resp = await axios.put(statusConfig.url, statusConfig.body || {}, config);
            } else {
              // Default to GET
              resp = await axios.get(statusConfig.url, config);
            }
            
            return { 
              url: statusConfig.url, 
              hostname: resp.data.hostname, 
              status: resp.data.state,
              method: statusConfig.method || 'GET'
            };
          } catch (error) {
            logger.warn('Service status check failed', { 
              url: server.status.url, 
              error: error.message 
            });
            return { 
              url: server.status.url, 
              hostname: null, 
              status: 'unreachable',
              method: server.status.method || 'GET'
            };
          }
        }));
      }
      
      return result;
    } catch (error) {
      logger.error('Error getting service statuses', { error: error.message });
      throw error;
    }
  }

  // Change server priority
  async changeServerPriority(service, url, session) {
    try {
      const servers = settingsService.getServiceServers(service);
      const primaryMode = settingsService.getServicePrimaryMode(service);
      
      logger.debug('Priority change request', {
        service,
        url,
        primaryMode,
        serverCount: servers.length
      });
      
      if (!servers || !servers.some(s => s.status.url === url)) {
        throw new Error('Invalid service or url');
      }
      
      // Send requests with appropriate auth headers
      const primaryServer = servers.find(s => s.status.url === url);
      const primaryAuthHeaders = await this.createAuthHeaders(session);
      
      // Use method and timeout from priority configuration
      const priorityConfig = primaryServer.priority;
      const primaryConfig = {
        headers: primaryAuthHeaders,
        timeout: priorityConfig.timeout || 10000
      };
      const primaryPriorityParams = priorityConfig.params?.primary || 'new_state=primary';
      
      logger.debug('Primary server priority config', { priorityConfig });
      logger.debug('Primary priority params', { primaryPriorityParams });
      
      if (priorityConfig.method === 'POST') {
        await axios.post(priorityConfig.url + '?' + primaryPriorityParams, priorityConfig.body || {}, primaryConfig);
      } else if (priorityConfig.method === 'PUT') {
        await axios.put(priorityConfig.url + '?' + primaryPriorityParams, priorityConfig.body || {}, primaryConfig);
      } else {
        await axios.get(priorityConfig.url + '?' + primaryPriorityParams, primaryConfig);
      }
      
      // For "only_one" mode - set other servers to secondary
      if (primaryMode === 'only_one') {
        await Promise.all(servers.filter(s => s.status.url !== url).map(async (server) => {
          const secondaryAuthHeaders = await this.createAuthHeaders(session);
          const secondaryPriorityConfig = server.priority;
          const secondaryPriorityParams = secondaryPriorityConfig.params?.secondary || 'new_state=secondary';
          const secondaryConfig = {
            headers: secondaryAuthHeaders,
            timeout: secondaryPriorityConfig.timeout || 10000
          };
          
          if (secondaryPriorityConfig.method === 'POST') {
            return axios.post(secondaryPriorityConfig.url + '?' + secondaryPriorityParams, secondaryPriorityConfig.body || {}, secondaryConfig);
          } else if (secondaryPriorityConfig.method === 'PUT') {
            return axios.put(secondaryPriorityConfig.url + '?' + secondaryPriorityParams, secondaryPriorityConfig.body || {}, secondaryConfig);
          } else {
            return axios.get(secondaryPriorityConfig.url + '?' + secondaryPriorityParams, secondaryConfig);
          }
        }));
      }
      
      logger.info('Server priority changed successfully', { service, url, primaryMode });
      return true;
    } catch (error) {
      logger.error('Priority change error', { 
        service, 
        url, 
        error: error.message,
        response: error.response?.data, 
        status: error.response?.status 
      });
      throw error;
    }
  }

  // Set secondary status in many mode
  async setSecondaryStatus(service, url, session) {
    try {
      const servers = settingsService.getServiceServers(service);
      const primaryMode = settingsService.getServicePrimaryMode(service);
      
      logger.debug('Set secondary request', {
        service,
        url,
        primaryMode,
        serverCount: servers.length
      });
      
      // Check server by base URL (without path)
      const serverExists = servers && servers.some(s => s.status.url.startsWith(url));
      if (!serverExists) {
        throw new Error('Invalid service or url');
      }
      
      // Check that this is many mode
      if (primaryMode !== 'many') {
        throw new Error(`Operation is only available for many mode (current mode: ${primaryMode})`);
      }
      
      // Send request to set secondary status
      const targetServer = servers.find(s => s.status.url.startsWith(url));
      const authHeaders = await this.createAuthHeaders(session);
      
      const priorityConfig = targetServer.priority;
      const config = {
        headers: authHeaders,
        timeout: priorityConfig.timeout || 10000
      };
      const secondaryPriorityParams = priorityConfig.params?.secondary || 'new_state=secondary';
      
      if (priorityConfig.method === 'POST') {
        await axios.post(priorityConfig.url + '?' + secondaryPriorityParams, priorityConfig.body || {}, config);
      } else if (priorityConfig.method === 'PUT') {
        await axios.put(priorityConfig.url + '?' + secondaryPriorityParams, priorityConfig.body || {}, config);
      } else {
        await axios.get(priorityConfig.url + '?' + secondaryPriorityParams, config);
      }
      
      logger.info('Secondary status set successfully', { service, url });
      return true;
    } catch (error) {
      logger.error('Set secondary error', { 
        service, 
        url, 
        error: error.message,
        response: error.response?.data, 
        status: error.response?.status 
      });
      throw error;
    }
  }
}

module.exports = new MonitoringService();
