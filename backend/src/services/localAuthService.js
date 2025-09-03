const fs = require('fs');
const yaml = require('js-yaml');
const { config } = require('../config');
const logger = require('../utils/logger');

class LocalAuthService {
  constructor() {
    this.config = config.localAuth;
  }

  // Local user authentication
  authenticateUser(username, password) {
    const users = this.getLocalUsers();
    
    if (!users[username]) {
      throw new Error('User not found');
    }
    
    if (users[username] !== password) {
      throw new Error('Invalid password');
    }
    
    logger.info('Local authentication successful', { username });
    return true;
  }

  // Get list of local users
  getLocalUsers() {
    const users = {};
    
    // Add user from environment variables
    if (this.config.manageUser && this.config.managePassword) {
      users[this.config.manageUser] = this.config.managePassword;
    }
    
    // Add users from file
    try {
      if (fs.existsSync(this.config.localUsersPath)) {
        const localUsersData = yaml.load(fs.readFileSync(this.config.localUsersPath, 'utf8'));
        Object.assign(users, localUsersData);
        logger.debug('Local users loaded from file', { 
          path: this.config.localUsersPath,
          userCount: Object.keys(localUsersData).length 
        });
      }
    } catch (error) {
      logger.error('Error loading local users file', { 
        path: this.config.localUsersPath,
        error: error.message 
      });
    }
    
    return users;
  }

  // Check if user exists
  userExists(username) {
    const users = this.getLocalUsers();
    return !!users[username];
  }

  // Get user count (for debugging)
  getUserCount() {
    const users = this.getLocalUsers();
    return Object.keys(users).length;
  }
}

module.exports = new LocalAuthService();
