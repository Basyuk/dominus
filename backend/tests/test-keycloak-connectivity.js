const axios = require('axios');

async function testKeycloakConnectivity() {
  console.log('=== Keycloak Connectivity Test ===');
  
  const baseUrl = process.env.KEYCLOAK_BASE_URL || 'http://localhost:8282';
  const realm = process.env.KEYCLOAK_REALM || 'master';
  
  console.log('Base URL:', baseUrl);
  console.log('Realm:', realm);
  
  try {
    // Test 1: Check Keycloak availability
    console.log('\n1. Checking Keycloak availability...');
    const healthUrl = `${baseUrl}/health`;
    console.log('Health URL:', healthUrl);
    
    try {
      const healthResponse = await axios.get(healthUrl, { timeout: 5000 });
      console.log('✅ Keycloak is available');
      console.log('Status:', healthResponse.status);
    } catch (error) {
      console.log('❌ Keycloak unavailable via health endpoint');
      console.log('Error:', error.message);
    }
    
    // Test 2: Check realm
    console.log('\n2. Checking realm...');
    const realmUrl = `${baseUrl}/realms/${realm}`;
    console.log('Realm URL:', realmUrl);
    
    try {
      const realmResponse = await axios.get(realmUrl, { timeout: 5000 });
      console.log('✅ Realm available');
      console.log('Status:', realmResponse.status);
      console.log('Realm info:', realmResponse.data.realm);
    } catch (error) {
      console.log('❌ Realm unavailable');
      console.log('Error:', error.message);
      
      // Additional info if status is available
      if (error.response) {
        console.log('Response status:', error.response.status);
      }
    }
    
    // Test 3: Check token endpoint
    console.log('\n3. Checking token endpoint...');
    const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;
    console.log('Token URL:', tokenUrl);
    
    try {
      // This should return 400 or 401 because we're not providing credentials
      const tokenResponse = await axios.post(tokenUrl, {
        grant_type: 'client_credentials'
      }, { 
        timeout: 5000,
        validateStatus: function (status) {
          // Accept any status code
          return true;
        }
      });
      console.log('✅ Token endpoint available');
      console.log('Status:', tokenResponse.status);
    } catch (error) {
      console.log('❌ Token endpoint unavailable or requires authorization');
      console.log('Error:', error.message);
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Testing error:', error.message);
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testKeycloakConnectivity();
}

module.exports = testKeycloakConnectivity;
testKeycloakConnectivity(); 