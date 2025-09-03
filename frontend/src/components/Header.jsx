import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import Logo from './Logo';
import { USER_MESSAGES } from '../constants';
import { SSOUtils } from '../utils/sso';
import { safeDisplayText } from '../utils/security';

const Header = ({ onLogout }) => {
  const authInfo = SSOUtils.getAuthMethodInfo();

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Box display="flex" alignItems="center">
      <Logo variant="header" sx={{ 
          mr: 2, 
          flexShrink: 0,
          width: '48px !important',
          height: '48px !important',
          maxWidth: '48px !important',
          maxHeight: '48px !important'
        }} />
        <Box>
          <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
            {USER_MESSAGES.INFRASTRUCTURE_MANAGEMENT}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {USER_MESSAGES.AUTH_METHOD} {safeDisplayText(authInfo.displayName)}
          </Typography>
        </Box>
      </Box>
      <Button 
        variant="outlined" 
        color="secondary" 
        onClick={onLogout} 
        size="medium"
      >
        {USER_MESSAGES.LOGOUT}
      </Button>
    </Stack>
  );
};

export default Header; 