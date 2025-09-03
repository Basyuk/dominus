import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import LoginPage from './LoginPage';
import MainPage from './MainPage';
import AuthCallback from './AuthCallback';
import { LogConfig } from './components';
import { useAuth } from './hooks';
import { SSOUtils } from './utils';
import { logInfo, logDebug, logSecure, logWarn } from './utils/logger';

const theme = createTheme();

export default function App() {
  const [isCallback, setIsCallback] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { token, handleSSOCallback, logout, isAuthenticated } = useAuth();

  logSecure('App render', { 
    hasToken: !!token, 
    isAuthenticated 
  });
  
  // Check token in localStorage directly
  const localStorageToken = localStorage.getItem('token');
  const authMethod = localStorage.getItem('authMethod');
  logDebug('localStorage check', { 
    hasToken: !!localStorageToken, 
    authMethod 
  });

  useEffect(() => {
    // Check if there are callback parameters in URL
    const urlParams = SSOUtils.getUrlParams();
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const logoutParam = urlParams.get('logout');
    
    logDebug('App.jsx: Checking URL params', { 
      hasCode: !!code, 
      hasState: !!state, 
      logoutParam 
    });
    
    if (code && state) {
      // There are OAuth2 code callback parameters - show processing component
      logInfo('Setting isCallback to true');
      setIsCallback(true);
    } else if (logoutParam === 'true') {
      // Handle logout callback from Keycloak
      SSOUtils.handleLogoutCallback(urlParams);
    }
  }, []);

  const handleKeycloakCallback = async (accessToken, state) => {
    const result = await handleSSOCallback(accessToken, state);
    if (result.success) {
      setIsCallback(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Force state update after logout
    setForceUpdate(prev => prev + 1);
  };

  const handleLogin = (newToken) => {
    logSecure('handleLogin called', { hasToken: !!newToken });
    setIsCallback(false);
    // Token already updated in localStorage, force component update
    setTimeout(() => {
      // Instead of page reload, just update state
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        logInfo('Token found in localStorage, forcing re-render');
        // Force component update
        setForceUpdate(prev => prev + 1);
        // Just change URL without callback parameters
        window.history.replaceState({}, document.title, '/');
      } else {
        logWarn('No token found in localStorage');
      }
    }, 500);
  };

  logDebug('App.jsx: Rendering', { 
    isCallback, 
    hasLocalStorageToken: !!localStorageToken, 
    forceUpdate 
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {isCallback ? (
        <AuthCallback onLogin={handleLogin} />
      ) : !localStorageToken ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <MainPage token={localStorageToken} authMethod={authMethod} onLogout={handleLogout} />
      )}
      
      <LogConfig />
    </ThemeProvider>
  );
} 