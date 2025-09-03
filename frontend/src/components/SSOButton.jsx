import React from 'react';
import { Button } from '@mui/material';
import { USER_MESSAGES } from '../constants';

const SSOButton = ({ onClick, loading, disabled }) => {
  return (
    <Button 
      onClick={onClick}
      variant="outlined" 
      fullWidth 
      sx={{ mt: 2 , backgroundColor: '#731982' }}
      disabled={loading || disabled}
    >
      {loading ? USER_MESSAGES.SSO_REDIRECT : USER_MESSAGES.SSO_LOGIN_BUTTON}
    </Button>
  );
};

export default SSOButton; 