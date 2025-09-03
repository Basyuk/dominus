const fs = require('fs');
const path = require('path');

// Check local authorization configuration
function checkLocalConfig() {
  console.log('=== Local Authorization Configuration Check ===');
  console.log('MANAGE_USER:', process.env.MANAGE_USER || 'NOT SET');
  console.log('MANAGE_PASSWORD:', process.env.MANAGE_PASSWORD ? '***' : 'NOT SET');

  if (!process.env.MANAGE_USER || !process.env.MANAGE_PASSWORD) {
    console.log('⚠️ Environment variables MANAGE_USER/MANAGE_PASSWORD not set');
  }
}

// Load local users
function loadLocalUsers() {
  const localUsersPath = path.join(__dirname, '..', 'local-users.yml');
  const localUsersExamplePath = path.join(__dirname, '..', 'local-users.example.yml');

  console.log('\n=== Local Users File Check ===');
  console.log('Checking file:', localUsersPath);

  try {
    if (fs.existsSync(localUsersPath)) {
      const content = fs.readFileSync(localUsersPath, 'utf8');
      console.log('✅ Local users file loaded');
    } else {
      console.log('⚠️ Local users file not found');
    }
  } catch (error) {
    console.log('❌ Error loading local users file:', error.message);
  }

  console.log('Example file:', localUsersExamplePath);
}

// Test local authorization
function testLocalAuth(username, password) {
  if (!username || !password) {
    return;
  }

  console.log('=== Local Authorization Test ===');
  console.log('Checking user:', username);

  if (username !== process.env.MANAGE_USER) {
    console.log('❌ User not found');
    return;
  }

  if (password !== process.env.MANAGE_PASSWORD) {
    console.log('❌ Invalid password');
    return;
  }

  console.log('✅ Authorization successful');
}

// List all users
function listUsers() {
  const envUsers = [];
  
  console.log('=== Local Users List ===');

  if (process.env.MANAGE_USER) {
    envUsers.push({ username: process.env.MANAGE_USER, source: 'environment' });
  }

  console.log('Found users:', envUsers);
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  checkLocalConfig();
  loadLocalUsers();
  listUsers();

  if (args.length >= 2) {
    testLocalAuth(args[0], args[1]);
  } else {
    console.log('\nTo test authorization, specify username and password:');
    console.log('node test-local-auth.js <username> <password>');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkLocalConfig, loadLocalUsers, testLocalAuth, listUsers };