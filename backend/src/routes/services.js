const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const settingsService = require('../services/settingsService');
const monitoringService = require('../services/monitoringService');
const logger = require('../utils/logger');

// Get services list
router.get('/services', authMiddleware, (req, res) => {
  try {
    const servicesData = settingsService.getServicesList();
    logger.debug('/api/services response', { servicesData });
    res.json(servicesData);
  } catch (error) {
    logger.error('/api/services error', { error: error.message });
    res.status(500).json({ success: false, message: 'Error reading settings', error: error.message });
  }
});

// Get service configurations
router.get('/service-configs', authMiddleware, (req, res) => {
  try {
    const serviceConfigs = settingsService.getServiceConfigs();
    logger.debug('/api/service-configs response', { serviceConfigs });
    res.json(serviceConfigs);
  } catch (error) {
    logger.error('/api/service-configs error', { error: error.message });
    res.status(500).json({ success: false, message: 'Error reading service configuration', error: error.message });
  }
});

// Get service statuses
router.get('/statuses', authMiddleware, async (req, res) => {
  try {
    const result = await monitoringService.getServiceStatuses(req.sessionUser);
    res.json(result);
  } catch (error) {
    logger.error('Error getting statuses', { error: error.message });
    res.status(500).json({ success: false, message: 'Error reading statuses', error: error.message });
  }
});

// Change server priority
router.put('/priority', authMiddleware, async (req, res) => {
  const { service, url } = req.body;
  const { username, password, authMethod } = req.sessionUser || {};
  
  logger.debug('Priority update request', { service, url, username, authMethod });
  
  if (!username) {
    return res.status(401).json({ success: false, message: 'No authentication data' });
  }
  
  // Password not required for Keycloak users
  if (authMethod === 'keycloak' && !password) {
    logger.debug('Priority update: Keycloak user, password not required');
  } else if (authMethod === 'local' && !password) {
    return res.status(401).json({ success: false, message: 'No authentication data' });
  }
  
  try {
    await monitoringService.changeServerPriority(service, url, req.sessionUser);
    res.json({ success: true });
  } catch (error) {
    logger.error('Priority update error details', { 
      message: error.message, 
      response: error.response?.data, 
      status: error.response?.status, 
      url: error.config?.url, 
      method: error.config?.method 
    });
    
    // If external service returned 403, return 403 with permissions message
    if (error.response && error.response.status === 403) {
      return res.status(403).json({ 
        success: false, 
        message: 'No management permissions',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error changing primary server', 
      error: error.message,
      details: error.response?.data || 'No response data'
    });
  }
});

// Set secondary status in many mode
router.put('/set-secondary', authMiddleware, async (req, res) => {
  const { service, url } = req.body;
  const { username, password, authMethod } = req.sessionUser || {};
  
  logger.debug('Set secondary request', { service, url, username, authMethod });
  
  if (!username) {
    return res.status(401).json({ success: false, message: 'No authentication data' });
  }
  
  // Password not required for Keycloak users
  if (authMethod === 'keycloak' && !password) {
    logger.debug('Set secondary: Keycloak user, password not required');
  } else if (authMethod === 'local' && !password) {
    return res.status(401).json({ success: false, message: 'No authentication data' });
  }
  
  try {
    await monitoringService.setSecondaryStatus(service, url, req.sessionUser);
    res.json({ success: true });
  } catch (error) {
    logger.error('Set secondary error details', { 
      message: error.message, 
      response: error.response?.data, 
      status: error.response?.status, 
      url: error.config?.url, 
      method: error.config?.method 
    });
    
    // If external service returned 403, return 403 with permissions message
    if (error.response && error.response.status === 403) {
      return res.status(403).json({ 
        success: false, 
        message: 'No management permissions',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error setting secondary status', 
      error: error.message,
      details: error.response?.data || 'No response data'
    });
  }
});

module.exports = router;
