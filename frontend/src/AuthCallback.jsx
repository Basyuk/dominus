import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { SSOUtils } from './utils';
import { ERROR_MESSAGES } from './constants';
import { getPKCEParams, clearPKCEParams } from './utils/pkce';
import { safeDisplayText } from './utils/security';
import { logInfo, logError, logDebug, logSecure } from './utils/logger';

export default function AuthCallback({ onLogin }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  logInfo('AuthCallback component mounted');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        logInfo('AuthCallback: Starting SSO callback processing');
        const urlParams = SSOUtils.getUrlParams();
        logDebug('URL params', { params: Object.fromEntries(urlParams.entries()) });
        const { code, state } = SSOUtils.validateCallbackParams(urlParams);
        logSecure('Code and state extracted', { 
          hasCode: !!code, 
          hasState: !!state 
        });
        
        // Get PKCE parameters
        const { codeVerifier, state: savedState } = getPKCEParams();
        
        // Check state for security
        SSOUtils.validateState(state, savedState);
        
        // Clear PKCE parameters
        clearPKCEParams();
        
        // Send code and code_verifier to backend for token exchange
        const response = await fetch('/api/sso/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            code,
            state,
            code_verifier: codeVerifier,
            redirect_uri: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3001'
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        logInfo('SSO callback response received', { 
          hasToken: 'token' in data,
          hasKeycloakToken: 'keycloakToken' in data,
          hasSuccess: 'success' in data
        });
        
        if (data.success) {
          // Save tokens
          localStorage.setItem('token', data.token);
          localStorage.setItem('authMethod', 'keycloak');
          if (data.keycloakToken) {
            localStorage.setItem('keycloakToken', data.keycloakToken);
          }
          if (data.keycloakRefreshToken) {
            localStorage.setItem('keycloakRefreshToken', data.keycloakRefreshToken);
          }
          
          logSecure('Tokens saved to localStorage', { 
            hasToken: !!data.token,
            hasKeycloakToken: !!data.keycloakToken,
            authMethod: localStorage.getItem('authMethod')
          });
          
          // Clear URL parameters
          SSOUtils.clearUrlParams();
          
          // Call login callback
          onLogin(data.token);
        } else {
          logWarn('SSO callback failed', { message: data.message });
          setError(data.message || ERROR_MESSAGES.AUTH_ERROR);
        }
      } catch (error) {
        logError('Error processing callback', { error: error.message });
        setError(error.message || ERROR_MESSAGES.CALLBACK_ERROR);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [onLogin]);

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {safeDisplayText(error)}
        </Alert>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress size={60} sx={{ mb: 2 }} />
      <Typography variant="h6">Completing login...</Typography>
    </Box>
  );
}