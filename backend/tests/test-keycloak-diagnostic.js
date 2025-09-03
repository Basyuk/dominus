const axios = require('axios');

// Keycloak diagnostic test
async function testKeycloakDiagnostic() {
  console.log('=== Keycloak Diagnostics ===');

  try {
    // 1. Check Keycloak status
    console.log('1. Checking Keycloak status...');

    const baseUrl = process.env.KEYCLOAK_BASE_URL;
    const realm = process.env.KEYCLOAK_REALM;
    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

    console.log('   Base URL:', baseUrl || 'NOT SET');
    console.log('   Realm:', realm || 'NOT SET');
    console.log('   Client ID:', clientId || 'NOT SET');
    console.log('   Client Secret:', clientSecret ? '***' : 'NOT SET');

    if (!baseUrl || !realm || !clientId) {
      console.log('   ❌ Keycloak disabled in settings');
      return;
    }

    if (!baseUrl || !realm || !clientId || !clientSecret) {
      console.log('   ❌ Not all required Keycloak settings are specified');
      return;
    }

    if (!clientSecret) {
      console.log('   ❌ Client Secret not specified');
      return;
    }

    console.log('   ✅ Keycloak settings are correct');

    // 2. Check Keycloak server availability
    console.log('\n2. Checking Keycloak server availability...');
    const realmUrl = `${baseUrl}/realms/${realm}`;
    console.log('   URL:', realmUrl);

    try {
      await axios.get(realmUrl, { timeout: 5000 });
      console.log('   ✅ Keycloak server available');
    } catch (error) {
      console.log('   ❌ Keycloak server unavailable:', error.message);
      console.log('   Check:');
      console.log('     - Keycloak server URL');
      console.log('     - Network connection');
      console.log('     - Realm name');
      return;
    }

    // 3. Check token endpoint availability
    console.log('\n3. Checking token endpoint availability...');
    const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;
    console.log('   URL:', tokenUrl);

    try {
      await axios.get(tokenUrl, { timeout: 5000 });
      console.log('   ✅ Token endpoint available');
    } catch (error) {
      if (error.response && error.response.status === 405) {
        console.log('   ✅ Token endpoint available (expected 405 error for GET)');
      } else {
        console.log('   ❌ Token endpoint unavailable:', error.message);
      }
    }

    // 4. Check userinfo endpoint availability
    console.log('\n4. Checking userinfo endpoint availability...');
    const userInfoUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/userinfo`;
    console.log('   URL:', userInfoUrl);

    try {
      await axios.get(userInfoUrl, { timeout: 5000 });
      console.log('   ✅ UserInfo endpoint available');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('   ✅ UserInfo endpoint available (expected 401 error without token)');
      } else {
        console.log('   ❌ UserInfo endpoint unavailable:', error.message);
      }
    }

    // 5. Check client settings (attempt to get client info)
    console.log('\n5. Checking client settings...');
    const clientsUrl = `${baseUrl}/admin/realms/${realm}/clients`;

    try {
      const response = await axios.get(clientsUrl, { timeout: 5000 });
      console.log('   ✅ Clients endpoint available');
      
      // Look for our client
      const clients = response.data;
      const client = clients.find(c => c.clientId === clientId);
      if (client) {
        console.log('   ✅ Client found in Keycloak');
        console.log('     - Client ID:', client.clientId);
        console.log('     - Public Client:', client.publicClient);
        console.log('     - Direct Access Grants:', client.directAccessGrantsEnabled);
      } else {
        console.log('   ❌ Client not found in Keycloak');
        console.log('   Check Client ID in settings');
      }
    } catch (error) {
      console.log('   ⚠️ Could not check client:', error.message);
    }

    console.log('\n=== Diagnostics Complete ===');
    console.log('\nPossible causes of "Error exchanging authorization code for token" error:');
    console.log('1. Invalid Client Secret');
    console.log('2. Invalid Redirect URI (must exactly match Keycloak settings)');
    console.log('3. Authorization code already used or expired');
    console.log('4. Invalid Client ID');
    console.log('5. Client not configured as confidential');
    console.log('6. Direct Access Grants not enabled in client settings');

  } catch (error) {
    console.error('❌ Diagnostics error:', error.response?.data || error.message);
  }
}

// Run test
if (require.main === module) {
  testKeycloakDiagnostic();
}

module.exports = testKeycloakDiagnostic;