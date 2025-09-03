require('dotenv').config();
const axios = require('axios');

// Keycloak configuration check
function checkKeycloakConfig() {
  console.log('=== Keycloak configuration check ===');
  console.log('KEYCLOAK_ENABLED:', process.env.KEYCLOAK_ENABLED);
  console.log('KEYCLOAK_BASE_URL:', process.env.KEYCLOAK_BASE_URL);
  console.log('KEYCLOAK_REALM:', process.env.KEYCLOAK_REALM);
  console.log('KEYCLOAK_CLIENT_ID:', process.env.KEYCLOAK_CLIENT_ID);
  console.log('KEYCLOAK_CLIENT_SECRET:', process.env.KEYCLOAK_CLIENT_SECRET ? '***' : 'NOT SET');
  console.log('');
}

// Keycloak connection test
async function testKeycloakConnection() {
  if (process.env.KEYCLOAK_ENABLED !== 'true') {
    console.log('Keycloak disabled in configuration');
    return;
  }

  console.log('=== Keycloak connection test ===');
  
  try {
    const url = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}`;
    console.log('Checking availability:', url);
    
    const response = await axios.get(url, { timeout: 5000 });
    console.log('✅ Keycloak available');
    console.log('Realm:', response.data.realm);
    console.log('Display Name:', response.data.displayName);
    console.log('');
  } catch (error) {
    console.log('❌ Keycloak connection error:');
    console.log('   URL:', `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}`);
    console.log('   Error:', error.message);
    console.log('');
  }
}

// Token retrieval test
async function testTokenRequest() {
  if (process.env.KEYCLOAK_ENABLED !== 'true') {
    return;
  }

  console.log('=== Token retrieval test ===');
  
  const username = process.argv[2];
  const password = process.argv[3];
  
  if (!username || !password) {
    console.log('❌ Specify username and password for testing:');
    console.log('   node test-keycloak.js <username> <password>');
    console.log('');
    return;
  }

  try {
    const tokenUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
      username: username,
      password: password
    });

    console.log('Sending token request...');
    
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });

    console.log('✅ Token retrieved successfully');
    console.log('Access Token:', response.data.access_token.substring(0, 50) + '...');
    console.log('Refresh Token:', response.data.refresh_token.substring(0, 50) + '...');
    console.log('Expires In:', response.data.expires_in, 'seconds');
    console.log('Token Type:', response.data.token_type);
    console.log('');
  } catch (error) {
    console.log('❌ Token retrieval error:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    } else {
      console.log('   Error:', error.message);
    }
    console.log('');
  }
}

// Main function
async function main() {
  checkKeycloakConfig();
  await testKeycloakConnection();
  await testTokenRequest();
}

main().catch(console.error); 