import { useState, useEffect, useCallback } from 'react';
import { apiService, saveAuthData, clearAuthData, getAuthData } from '../utils/api';
import { ERROR_MESSAGES } from '../constants';
import { 
  generateCodeVerifier, 
  generateCodeChallenge, 
  savePKCEParams, 
  getPKCEParams, 
  clearPKCEParams 
} from '../utils/pkce';

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login with local credentials
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.login(credentials);
      
      if (data.success) {
        const authData = {
          token: data.token,
          authMethod: data.authMethod,
          keycloakToken: data.keycloakToken,
        };
        
        saveAuthData(authData);
        setToken(data.token);
        return { success: true };
      } else {
        setError(data.message || ERROR_MESSAGES.CONNECTION_ERROR);
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.message || ERROR_MESSAGES.CONNECTION_ERROR;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // SSO login
  const ssoLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getKeycloakConfig();
      
      if (!data.success || !data.config.enabled) {
        setError(ERROR_MESSAGES.SSO_NOT_CONFIGURED);
        return { success: false, error: ERROR_MESSAGES.SSO_NOT_CONFIGURED };
      }
      
      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = crypto.randomUUID();
      
      // Save PKCE parameters
      savePKCEParams(codeVerifier, state);
      
      // Create authorization URL with PKCE
      const { baseUrl, realm, clientId } = data.config;
      const redirectUri = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3001';
      
      const authUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&response_type=code` +
        `&scope=openid` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${encodeURIComponent(state)}` +
        `&code_challenge=${encodeURIComponent(codeChallenge)}` +
        `&code_challenge_method=S256` +
        `&prompt=login`;
      
      // Redirect to Keycloak login page
      window.location.href = authUrl;
      return { success: true };
    } catch (error) {
      const errorMessage = ERROR_MESSAGES.SSO_CONNECTION_ERROR;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle SSO callback
  const handleSSOCallback = useCallback(async (accessToken, state) => {
    try {
      // Get PKCE parameters
      const { codeVerifier, state: savedState } = getPKCEParams();
      
      // Check state for security
      if (state !== savedState) {
        setError(ERROR_MESSAGES.INVALID_STATE);
        setToken(null);
        return { success: false, error: ERROR_MESSAGES.INVALID_STATE };
      }
      
      // Clear PKCE parameters
      clearPKCEParams();
      
      // Send access_token and code_verifier to backend to create session
      const data = await apiService.ssoTokenCallback(accessToken, codeVerifier);
      
      if (data.success) {
        const authData = {
          token: data.token,
          authMethod: 'keycloak',
          keycloakToken: data.keycloakToken,
          keycloakRefreshToken: data.keycloakRefreshToken,
        };
        
        saveAuthData(authData);
        setToken(data.token);
        
        // Clear URL from parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        return { success: true };
      } else {
        setError(data.message || ERROR_MESSAGES.AUTH_ERROR);
        setToken(null);
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = ERROR_MESSAGES.CALLBACK_ERROR;
      setError(errorMessage);
      setToken(null);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      const authData = getAuthData();
      console.log('Logout: auth data:', {
        hasToken: !!authData.token,
        authMethod: authData.authMethod,
        hasKeycloakToken: !!authData.keycloakToken
      });
      
      if (authData.token) {
        // Send logout request to backend
        console.log('Logout: sending logout request to backend');
        const response = await apiService.logout(authData.token);
        console.log('Logout: backend response:', response);
        
        // If this is Keycloak authentication, perform additional logout
        if (authData.authMethod === 'keycloak' && response.success) {
          const logoutUrlResponse = await apiService.getLogoutUrl(
            authData.token,
            import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3001'
          );
          
          if (logoutUrlResponse.success && logoutUrlResponse.logoutUrl) {
            // Clear local data
            clearAuthData();
            setToken(null);
            
            // Redirect to Keycloak logout
            window.location.href = logoutUrlResponse.logoutUrl;
            return;
          }
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local data regardless of request result
      console.log('Logout: clearing auth data');
      clearAuthData();
      setToken(null);
      console.log('Logout: auth data cleared, localStorage token:', localStorage.getItem('token'));
    }
  }, []);

  // Check authentication on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return {
    token,
    loading,
    error,
    login,
    ssoLogin,
    handleSSOCallback,
    logout,
    isAuthenticated: !!token,
  };
}; 