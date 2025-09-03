const fs = require('fs');
const yaml = require('js-yaml');
const { config } = require('../config');
const logger = require('../utils/logger');

class SettingsService {
  constructor() {
    this.settingsPath = config.files.settingsPath;
  }

  // Load settings from file
  loadSettings() {
    try {
      const file = fs.readFileSync(this.settingsPath, 'utf8');
      const data = yaml.load(file);
      logger.debug('Settings loaded', { path: this.settingsPath });
      return data;
    } catch (error) {
      logger.error('Error loading settings', { 
        path: this.settingsPath,
        error: error.message 
      });
      return {};
    }
  }

  // Get settings in legacy format for backward compatibility
  getLegacySettings() {
    const data = this.loadSettings();
    return this.transformToLegacyFormat(data);
  }

  // Convert new structure to old for backward compatibility
  transformToLegacyFormat(data) {
    if (!data.Services || !data.Types) {
      // If structure is old, return as is
      return data;
    }
    
    const legacyData = {};
    
    // Create type map for fast access
    const typesMap = {};
    data.Types.forEach(type => {
      typesMap[type.name] = type;
    });
    
    // Convert services to old format
    data.Services.forEach(service => {
      const serviceType = typesMap[service.type];
      if (!serviceType) {
        logger.warn(`Type ${service.type} not found for service ${service.name}`);
        return;
      }
      
      // Create server array for each service
      legacyData[service.name] = service.url.map(url => ({
        status: {
          url: url + serviceType.status.path,
          method: serviceType.status.method || 'GET',
          timeout: serviceType.status.timeout || 2000,
          body: serviceType.status.body || {}
        },
        priority: {
          url: url + serviceType.priority.path,
          method: serviceType.priority.method || 'PUT',
          timeout: serviceType.priority.timeout || 10000,
          body: serviceType.priority.body || {},
          params: serviceType.priority.params || {}
        }
      }));
    });
    
    return legacyData;
  }

  // Get service primary_mode
  getServicePrimaryMode(serviceName) {
    try {
      const data = this.loadSettings();
      if (!data.Services || !data.Types) {
        return 'only_one'; // Default for old structure
      }
      
      const service = data.Services.find(s => s.name === serviceName);
      return service?.primary_mode || 'only_one';
    } catch (error) {
      logger.error('Error getting service primary mode', { 
        serviceName, 
        error: error.message 
      });
      return 'only_one';
    }
  }

  // Get services list for API
  getServicesList() {
    try {
      const data = this.loadSettings();
      const legacyData = this.transformToLegacyFormat(data);
      
      // Convert structure for backward compatibility with frontend
      const servicesData = {};
      for (const [service, servers] of Object.entries(legacyData)) {
        servicesData[service] = servers.map(server => server.status.url);
      }
      
      logger.debug('Services list generated', { 
        serviceCount: Object.keys(servicesData).length 
      });
      return servicesData;
    } catch (error) {
      logger.error('Error getting services list', { error: error.message });
      return {};
    }
  }

  // Get service configurations
  getServiceConfigs() {
    try {
      const data = this.loadSettings();
      
      if (!data.Services || !data.Types) {
        // If structure is old, return empty object (default only_one)
        return {};
      }
      
      // Create object with primary_mode settings for each service
      const serviceConfigs = {};
      data.Services.forEach(service => {
        serviceConfigs[service.name] = {
          primary_mode: service.primary_mode || 'only_one'
        };
      });
      
      logger.debug('Service configs generated', { 
        configCount: Object.keys(serviceConfigs).length 
      });
      return serviceConfigs;
    } catch (error) {
      logger.error('Error getting service configs', { error: error.message });
      return {};
    }
  }

  // Get servers for specific service
  getServiceServers(serviceName) {
    try {
      const legacyData = this.getLegacySettings();
      return legacyData[serviceName] || [];
    } catch (error) {
      logger.error('Error getting service servers', { 
        serviceName, 
        error: error.message 
      });
      return [];
    }
  }

  // Check service existence
  serviceExists(serviceName) {
    try {
      const legacyData = this.getLegacySettings();
      return !!legacyData[serviceName];
    } catch (error) {
      logger.error('Error checking service existence', { 
        serviceName, 
        error: error.message 
      });
      return false;
    }
  }

  // Get all service names
  getAllServiceNames() {
    try {
      const legacyData = this.getLegacySettings();
      return Object.keys(legacyData);
    } catch (error) {
      logger.error('Error getting service names', { error: error.message });
      return [];
    }
  }
}

module.exports = new SettingsService();
