// Validation utilities

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (minimum 6 characters)
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Login form validation
export const validateLoginForm = (credentials) => {
  const errors = {};
  
  if (!credentials.username || credentials.username.trim() === '') {
    errors.username = 'Username is required';
  }
  
  if (!credentials.password || credentials.password.trim() === '') {
    errors.password = 'Password is required';
  } else if (!isValidPassword(credentials.password)) {
    errors.password = 'Password must contain at least 6 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Filter validation
export const validateFilter = (filter) => {
  return filter && filter.trim().length > 0;
};

// Remove extra spaces from string
export const sanitizeString = (str) => {
  return str ? str.trim() : '';
}; 