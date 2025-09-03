const axios = require('axios');

// Full logout flow test with Keycloak
async function testLogoutFlow() {
  console.log('=== Full logout flow test with Keycloak ===');
  
  try {
    // 1. Login via Keycloak (simulation)
    console.log('1. Performing login...');
    const loginResponse = await axios.post('http://localhost:3001/api/login', {
      username: 'test-user',
      password: 'test-password'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const { token, authMethod } = loginResponse.data;
    console.log('   Token received:', token.substring(0, 20) + '...');
    console.log('   Authorization method:', authMethod);
    
    // 2. Get logout URL
    console.log('\n2. Getting logout URL...');
    const logoutUrlResponse = await axios.get(`http://localhost:3001/api/logout-url?redirect_uri=${encodeURIComponent('http://localhost:3000')}`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Logout URL received:', logoutUrlResponse.data.logoutUrl);
    
    // 3. Perform logout
    console.log('\n3. Performing logout...');
    const logoutResponse = await axios.post('http://localhost:3001/api/logout', {}, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Logout performed:', logoutResponse.data.message);
    console.log('   Authorization method:', logoutResponse.data.authMethod);
    
    // 4. Check that session is removed
    console.log('\n4. Checking session removal...');
    try {
      await axios.get('http://localhost:3001/api/services', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ❌ ERROR: Session not removed!');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('   ✅ Session successfully removed');
      } else {
        console.log('   ❌ Unexpected error:', error.message);
      }
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('❌ Test error:', error.response?.data || error.message);
  }
}

// Run test
if (require.main === module) {
  testLogoutFlow();
}

module.exports = { testLogoutFlow }; 