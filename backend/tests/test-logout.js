require('dotenv').config();
const axios = require('axios');

// Keycloak logout test
async function testLogout() {
  console.log('=== Keycloak logout test ===');
  
  const username = process.argv[2];
  const password = process.argv[3];
  
  if (!username || !password) {
    console.log('❌ Specify username and password for testing:');
    console.log('   node test-logout.js <username> <password>');
    return;
  }

  try {
    // 1. Get token for authorization
    console.log('1. Getting token for authorization...');
    const loginResponse = await axios.post('http://localhost:3001/api/login', {
      username,
      password,
      authType: 'keycloak'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Authorization error:', loginResponse.data.message);
      return;
    }
    
    const { token, authMethod } = loginResponse.data;
    console.log('✅ Authorization successful');
    console.log('   Auth Method:', authMethod);
    console.log('   JWT Token:', token.substring(0, 50) + '...');
    
    // 2. Check that we can make requests
    console.log('\n2. Checking API access...');
    const statusResponse = await axios.get('http://localhost:3001/api/statuses', {
      headers: {
        'Authorization': token
      }
    });
    
    if (statusResponse.status === 200) {
      console.log('✅ API access confirmed');
    } else {
      console.log('❌ API access error:', statusResponse.status);
      return;
    }
    
    // 3. Perform logout
    console.log('\n3. Performing system logout...');
    const logoutResponse = await axios.post('http://localhost:3001/api/logout', {}, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (logoutResponse.data.success) {
      console.log('✅ Logout performed successfully');
      console.log('   Message:', logoutResponse.data.message);
    } else {
      console.log('❌ Logout error:', logoutResponse.data.message);
      return;
    }
    
    // 4. Check that session was actually removed
    console.log('\n4. Checking session removal...');
    try {
      const testResponse = await axios.get('http://localhost:3001/api/statuses', {
        headers: {
          'Authorization': token
        }
      });
      console.log('❌ Session not removed - request succeeded');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Session successfully removed - request rejected with 401');
      } else {
        console.log('❌ Unexpected error during session check:', error.message);
      }
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
  await testLogout();
}

main().catch(console.error); 