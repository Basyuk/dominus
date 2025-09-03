/**
 * Security utilities and XSS attack prevention
 */

/**
 * Escapes HTML symbols for safe display
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Safely displays text by escaping HTML symbols
 * @param {string} text - Text to display
 * @returns {string} - Safe text for display
 */
export const safeText = (text) => {
  if (text === null || text === undefined) {
    return '';
  }
  return escapeHtml(String(text));
};

/**
 * Checks if string contains potentially dangerous HTML
 * @param {string} text - Text to check
 * @returns {boolean} - true if contains HTML tags
 */
export const containsHtml = (text) => {
  if (typeof text !== 'string') {
    return false;
  }
  const htmlRegex = /<[^>]*>/;
  return htmlRegex.test(text);
};

/**
 * Truncates text to safe length to prevent attacks
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default 1000)
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 1000) => {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Complete function for safe text display
 * @param {string} text - Text to display
 * @param {number} maxLength - Maximum length
 * @returns {string} - Safe text for display
 */
export const safeDisplayText = (text, maxLength = 1000) => {
  const truncated = truncateText(text, maxLength);
  return safeText(truncated);
};

/**
 * Validates and sanitizes service data
 * @param {object} serviceData - Service data
 * @returns {object} - Sanitized data
 */
export const sanitizeServiceData = (serviceData) => {
  if (!serviceData || typeof serviceData !== 'object') {
    return {};
  }

  const sanitized = {};
  
  // Sanitize service name
  if (serviceData.service && typeof serviceData.service === 'string') {
    sanitized.service = safeDisplayText(serviceData.service, 100);
  }
  
  // Sanitize URL
  if (serviceData.url && typeof serviceData.url === 'string') {
    sanitized.url = safeDisplayText(serviceData.url, 500);
  }
  
  // Sanitize hostname
  if (serviceData.hostname && typeof serviceData.hostname === 'string') {
    sanitized.hostname = safeDisplayText(serviceData.hostname, 200);
  }
  
  // Sanitize status
  if (serviceData.status && typeof serviceData.status === 'string') {
    sanitized.status = safeDisplayText(serviceData.status, 50);
  }
  
  return sanitized;
};

/**
 * Validates and sanitizes services array
 * @param {array} services - Services array
 * @returns {array} - Sanitized array
 */
export const sanitizeServicesArray = (services) => {
  if (!Array.isArray(services)) {
    return [];
  }
  
  return services.map(service => sanitizeServiceData(service));
};

/**
 * Checks if string is a safe URL
 * @param {string} url - URL to check
 * @returns {boolean} - true if URL is safe
 */
export const isSafeUrl = (url) => {
  if (typeof url !== 'string') {
    return false;
  }
  
  // Check that URL doesn't contain dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase();
  
  return !dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol));
};
