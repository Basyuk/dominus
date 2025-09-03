require('dotenv').config();
const axios = require('axios');

// Keycloak token refresh test
async function testTokenRefresh() {
  console.log('=== Keycloak token refresh test ===');
  
  const username = process.argv[2];
  const password = process.argv[3];
  
  if (!username || !password) {
    console.log('❌ Specify username and password for testing:');
    console.log('   node test-token-refresh.js <username> <password>');
    return;
  }

  try {
    // 1. Get initial token
    console.log('1. Getting initial token...');
    const loginResponse = await axios.post('http://localhost:3001/api/login', {
      username,
      password,
      authType: 'keycloak'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Authorization error:', loginResponse.data.message);
      return;
    }
    
    const { token, keycloakToken, authMethod } = loginResponse.data;
    console.log('✅ Authorization successful');
    console.log('   Auth Method:', authMethod);
    console.log('   JWT Token:', token.substring(0, 50) + '...');
    console.log('   Keycloak Token:', keycloakToken.substring(0, 50) + '...');
    
    // 2. Test token refresh
    console.log('\n2. Testing token refresh...');
    const refreshResponse = await axios.post('http://localhost:3001/api/refresh-token', {
      refreshToken: process.argv[4] || 'test-refresh-token'
    }, {
      headers: {
        'Authorization': token
      }
    });
    
    if (refreshResponse.data.success) {
      console.log('✅ Token refreshed successfully');
      console.log('   New Access Token:', refreshResponse.data.access_token.substring(0, 50) + '...');
      console.log('   New Refresh Token:', refreshResponse.data.refresh_token.substring(0, 50) + '...');
      console.log('   Expires In:', refreshResponse.data.expires_in, 'seconds');
    } else {
      console.log('❌ Token refresh error:', refreshResponse.data.message);
    }
    
    // 3. Test status request (should use refreshed token)
    console.log('\n3. Testing status request...');
    const statusResponse = await axios.get('http://localhost:3001/api/statuses', {
      headers: {
        'Authorization': token
      }
    });
    
    if (statusResponse.status === 200) {
      console.log('✅ Status request successful');
      console.log('   Services received:', Object.keys(statusResponse.data).length);
    } else {
      console.log('❌ Status request error:', statusResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Testing error:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    } else {
      console.log('   Error:', error.message);
    }
  }
}

// Configuration check
function checkConfig() {
  console.log('=== Configuration check ===');
  console.log('KEYCLOAK_ENABLED:', process.env.KEYCLOAK_ENABLED);
  console.log('KEYCLOAK_BASE_URL:', process.env.KEYCLOAK_BASE_URL);
  console.log('KEYCLOAK_REALM:', process.env.KEYCLOAK_REALM);
  console.log('KEYCLOAK_CLIENT_ID:', process.env.KEYCLOAK_CLIENT_ID);
  console.log('KEYCLOAK_CLIENT_SECRET:', process.env.KEYCLOAK_CLIENT_SECRET ? '***' : 'NOT SET');
  console.log('');
}

// Main function
async function main() {
  checkConfig();
  await testTokenRefresh();
}

main().catch(console.error); 