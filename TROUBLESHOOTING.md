# Troubleshooting

## Error "Error exchanging authorization code for token"

### Quick Diagnostics

1. **Run diagnostic test:**
   ```bash
   cd backend
   node tests/test-keycloak-diagnostic.js
   ```

2. **Check backend logs** - they now contain detailed error information

3. **Check Keycloak settings:**
   - Client ID matches `KEYCLOAK_CLIENT_ID`
   - Client Secret copied from "Credentials" tab
   - Access Type: "confidential"
   - Valid Redirect URIs: `http://localhost:3000`
   - Direct Access Grants Enabled: enabled

### Common Issues

#### 1. Invalid Redirect URI
**Symptom:** Error "invalid_grant" or "invalid_redirect_uri"
**Solution:** 
- In Keycloak: Valid Redirect URIs = `http://localhost:3000` (no trailing slash)
- In code: redirect_uri = `http://localhost:3000`

#### 2. Invalid Client Secret
**Symptom:** Error "unauthorized_client"
**Solution:**
- Copy Client Secret from "Credentials" tab in Keycloak
- Update `KEYCLOAK_CLIENT_SECRET` in backend/.env

#### 3. Authorization code expired
**Symptom:** Error "invalid_grant"
**Solution:**
- Authorization code can only be used once
- Try authorization again

#### 4. Client not configured as confidential
**Symptom:** Error "unauthorized_client"
**Solution:**
- In client settings: Access Type = "confidential"
- Public clients don't need Client Secret

### Settings Verification

#### Backend (.env):
```bash
KEYCLOAK_ENABLED=true
KEYCLOAK_BASE_URL=https://your-keycloak-server/auth
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

#### Frontend (.env):
```bash
VITE_KEYCLOAK_BASE_URL=https://your-keycloak-server/auth
VITE_KEYCLOAK_REALM=your-realm
VITE_KEYCLOAK_CLIENT_ID=your-client-id
```

### Testing

1. **Check Keycloak availability:**
   ```bash
   curl https://your-keycloak-server/auth/realms/your-realm
   ```

2. **Check backend settings:**
   ```bash
   curl http://localhost:3001/api/keycloak-status
   ```

3. **Check full flow:**
   ```bash
   cd backend
   node tests/test-sso-flow.js
   ```

### Debug Logs

When error occurs, backend logs will show:
- Token exchange URL
- Request parameters (without secrets)
- Detailed Keycloak response
- Status and error description

### Support

If issue persists, please provide:
1. Diagnostic test results
2. Backend logs when error occurs
3. Keycloak client settings (without secrets)