# Keycloak OAuth2 Authorization Setup

## Changes Overview

The following changes have been implemented for proper OAuth2 authorization through Keycloak:

### Frontend Changes:
1. **Added logo** `dominus.png` to login page and main page
2. **Redesigned authorization** to proper OAuth2 flow:
   - Redirect to Keycloak for authorization
   - Callback handling with state parameter validation
   - Exchange authorization code for token

### Backend Changes:
1. **Added function** `exchangeCodeForToken()` for code to token exchange
2. **Added function** `getUserInfoFromToken()` for getting user information
3. **Updated endpoint** `/api/sso/callback` for proper OAuth2 callback handling

## Keycloak Setup

### 1. Creating Client in Keycloak

1. Log into Keycloak admin panel
2. Select your realm
3. Go to "Clients" → "Create"
4. Configure client:
   - **Client ID**: `your-client-id`
   - **Client Protocol**: `openid-connect`
   - **Access Type**: `confidential` (for authorization code flow)
   - **Valid Redirect URIs**: `http://localhost:3001/*` (or your domain)
   - **Web Origins**: `http://localhost:3001` (or your domain)
   - **Post Logout Redirect URIs**: `http://localhost:3001` (or your domain)

### 2. Environment Variables Setup

#### Backend (.env):
```bash
KEYCLOAK_ENABLED=true
KEYCLOAK_BASE_URL=https://your-keycloak-server/auth
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret  # REQUIRED for confidential client
FRONTEND_URL=http://localhost:3001
```

**Note:** Frontend now gets Keycloak settings automatically from backend, so separate environment variables for frontend are not required.

### 3. Getting Client Secret

1. In Keycloak client settings go to "Credentials" tab
2. Copy "Client Secret"

## Authorization Flow

### SSO Authorization through Keycloak (Authorization Code Flow):

1. **User clicks "Login with SSO"**
2. **Frontend generates state** for security and redirects to Keycloak
3. **Keycloak shows login page** (username/password)
4. **User enters credentials** in Keycloak
5. **After successful authorization** Keycloak redirects back to application with `code` and `state`
6. **Frontend validates state** and sends `code` to backend
7. **Backend exchanges `code` for token** through Keycloak
8. **Backend gets user information** from token
9. **Backend creates JWT session** and returns token
10. **Frontend saves tokens** and shows main page

**Note:** Uses Authorization Code Flow (response_type=code), where Keycloak returns authorization code, which is then exchanged for token.

### Local Authorization:

1. **User enters username/password** in form
2. **Frontend sends data** to backend
3. **Backend validates credentials** in local file
4. **Backend creates JWT session** and returns token
5. **Frontend saves token** and shows main page

## Logout Flow

1. **User clicks "Logout"**
2. **Frontend sends request to backend** to delete local session
3. **Backend deletes session** and, if Keycloak authorization, sends logout to Keycloak
4. **Frontend gets logout URL** from backend
5. **Frontend redirects to Keycloak logout** with post_logout_redirect_uri
6. **Keycloak performs logout** and redirects back to application
7. **Frontend clears local tokens** and shows login page

## Security

- Uses **state parameter** for CSRF attack protection
- **Client Secret** is stored only on backend
- **Tokens** are automatically refreshed when expired
- **Token validation** occurs on every request

## Testing

### Automatic test:

```bash
cd backend
node tests/test-sso-flow.js
```

### Manual testing:

1. **Start backend and frontend:**
   ```bash
   # Backend
   cd backend
   npm start
   
   # Frontend (in another terminal)
   cd frontend
   npm run dev
   ```

2. **Open application in browser:**
   ```
   http://localhost:3001
   ```

3. **SSO Testing:**
   - Click "Login with SSO"
   - Should redirect to Keycloak
   - Enter credentials in Keycloak
   - After authorization you should return to application

4. **Local authorization testing:**
   - Enter username/password in form
   - Click "Login"
   - Authorization should occur

### Debug URL Examples:

**SSO URL (generated automatically):**
```
https://your-keycloak-server/auth/realms/your-realm/protocol/openid-connect/auth?client_id=your-client-id&response_type=code&scope=openid&redirect_uri=http%3A%2F%2Flocalhost%3A3001&state=random-state
```

**Callback URL (where Keycloak returns):**
```
http://localhost:3001?code=authorization-code&state=random-state
```

**Logout URL:**
```
https://your-keycloak-server/auth/realms/your-realm/protocol/openid-connect/logout?client_id=your-client-id&post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A3000
```

## Troubleshooting

### Error "SSO not configured"
- Check environment variables in frontend/.env
- Make sure all VITE_* variables are set

### Error "Keycloak not configured"
- Check environment variables in backend/.env
- Make sure KEYCLOAK_ENABLED=true

### Error "Invalid state parameter"
- Check redirect URI settings in Keycloak
- Make sure HTTPS is used (if required)

### Code to token exchange error

This error means backend cannot exchange authorization code for token in Keycloak.

**Diagnostics:**
```bash
cd backend
node tests/test-keycloak-diagnostic.js
```

**Possible causes and solutions:**

1. **Invalid Client Secret**
   - Check `KEYCLOAK_CLIENT_SECRET` in backend/.env
   - Make sure you copied secret from "Credentials" tab in Keycloak

2. **Invalid Redirect URI**
   - Redirect URI must **exactly match** settings in Keycloak
   - Check "Valid Redirect URIs" in client settings
   - Should be: `http://localhost:3000` (no trailing slash)

3. **Authorization code already used or expired**
   - Authorization code can only be used once
   - Code expires after few minutes
   - Try authorization again

4. **Invalid Client ID**
   - Check `KEYCLOAK_CLIENT_ID` in backend/.env
   - Make sure client exists in Keycloak

5. **Client not configured as confidential**
   - In client settings should be: "Access Type: confidential"
   - Public clients don't need Client Secret

6. **Direct Access Grants not enabled**
   - In client settings enable "Direct Access Grants Enabled"
   - This is necessary for OAuth2 authorization code flow

**Checking logs:**
When error occurs, backend logs will show detailed information:
- Token exchange URL
- Request parameters
- Keycloak response with error description

### Logout error
- Check Post Logout Redirect URIs settings in Keycloak
- Make sure logout URL is formed correctly
- Check that refresh token hasn't expired