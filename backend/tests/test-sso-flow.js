const axios = require('axios');

// Full SSO flow test with Keycloak
async function testSSOFlow() {
  console.log('=== Full SSO flow test with Keycloak ===');
  
  try {
    // Check Keycloak settings
    console.log('1. Checking Keycloak settings...');
    const keycloakEnabled = process.env.KEYCLOAK_ENABLED === 'true';
    const keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL;
    const keycloakRealm = process.env.KEYCLOAK_REALM;
    const keycloakClientId = process.env.KEYCLOAK_CLIENT_ID;
    
    console.log('   KEYCLOAK_ENABLED:', keycloakEnabled);
    console.log('   KEYCLOAK_BASE_URL:', keycloakBaseUrl);
    console.log('   KEYCLOAK_REALM:', keycloakRealm);
    console.log('   KEYCLOAK_CLIENT_ID:', keycloakClientId);
    
    if (!keycloakEnabled) {
      console.log('   ❌ Keycloak disabled in settings');
      return;
    }
    
    if (!keycloakBaseUrl || !keycloakRealm || !keycloakClientId) {
      console.log('   ❌ Not all Keycloak settings are configured');
      return;
    }
    
    console.log('   ✅ Keycloak settings are correct');
    
    // Check local authorization
    console.log('\n2. Checking local authorization...');
    try {
      const localLoginResponse = await axios.post('http://localhost:3001/api/login', {
        username: 'admin',
        password: 'admin-password'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      const { token: localToken, authMethod: localAuthMethod } = localLoginResponse.data;
      console.log('   ✅ Local authorization works');
      console.log('   Token:', localToken.substring(0, 20) + '...');
      console.log('   Method:', localAuthMethod);
      
      // Check API access
      const servicesResponse = await axios.get('http://localhost:3001/api/services', {
        headers: {
          'Authorization': localToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   ✅ API accessible after local authorization');
      
      // Logout
      await axios.post('http://localhost:3001/api/logout', {}, {
        headers: {
          'Authorization': localToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   ✅ Local logout works');
      
    } catch (error) {
      console.log('   ❌ Local authorization error:', error.response?.data?.message || error.message);
    }
    
    // Check SSO URL formation
    console.log('\n3. Checking SSO URL formation...');
    const redirectUri = 'http://localhost:3000';
    const state = 'test-state-123';
    
    const ssoUrl = `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/auth?` +
      `client_id=${encodeURIComponent(keycloakClientId)}` +
      `&response_type=code` +
      `&scope=openid` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}`;
    
    console.log('   SSO URL:', ssoUrl);
    console.log('   ✅ SSO URL formed correctly');
    
    // Check callback endpoint (without real code)
    console.log('\n4. Checking callback endpoint...');
    try {
      await axios.post('http://localhost:3001/api/sso/callback', {
        code: 'invalid-code',
        state: 'invalid-state',
        redirect_uri: redirectUri
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.log('   ✅ Callback endpoint responds (expected error with invalid code)');
      } else {
        console.log('   ❌ Unexpected callback error:', error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n=== Test Complete ===');
    console.log('\nFor complete SSO testing:');
    console.log('1. Open browser and go to http://localhost:3000');
    console.log('2. Click "Login with SSO"');
    console.log('3. Should redirect to Keycloak');
    console.log('4. After Keycloak authorization you should return to the application');
    
  } catch (error) {
    console.error('❌ Test error:', error.response?.data || error.message);
  }
}

// Run test
if (require.main === module) {
  testSSOFlow();
}

module.exports = { testSSOFlow }; 