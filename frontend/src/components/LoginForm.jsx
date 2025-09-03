import React, { useState } from 'react';
import { TextField, Button, Alert } from '@mui/material';
import { USER_MESSAGES } from '../constants';
import { safeDisplayText } from '../utils/security';

const LoginForm = ({ onSubmit, loading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
        required
        autoFocus
        disabled={loading}
      />
      
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        required
        disabled={loading}
      />
      
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        fullWidth 
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? USER_MESSAGES.LOGIN_LOADING : USER_MESSAGES.LOGIN_BUTTON}
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {safeDisplayText(error)}
        </Alert>
      )}
    </form>
  );
};

export default LoginForm; 