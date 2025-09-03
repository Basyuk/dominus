import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Logo, LoginForm, SSOButton } from './components';
import { useAuth } from './hooks';

export default function LoginPage({ onLogin }) {
  const { login, ssoLogin, loading, error } = useAuth();

  const handleLocalLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      onLogin(result.token);
    }
  };

  const handleSSOLogin = async () => {
    await ssoLogin();
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={3}>
          <Logo variant="login" sx={{ mb: 2, maxWidth: '80%', height: 'auto' }} />
          <Typography variant="h5" align="center">
            System Login
          </Typography>
        </Box>
        
        <LoginForm 
          onSubmit={handleLocalLogin}
          loading={loading}
          error={error}
        />
        
        <SSOButton 
          onClick={handleSSOLogin}
          loading={loading}
          disabled={loading}
        />
      </Paper>
    </Box>
  );
} 