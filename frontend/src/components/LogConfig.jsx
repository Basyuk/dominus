import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { getLogConfig } from '../utils/logger';

const LogConfig = () => {
  const config = getLogConfig();
  
  // Show only in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Box 
      position="fixed" 
      bottom={16} 
      right={16} 
      bgcolor="rgba(0,0,0,0.8)" 
      color="white" 
      p={2} 
      borderRadius={2}
      fontSize="12px"
      zIndex={9999}
    >
      <Typography variant="caption" display="block" mb={1}>
        Logging: {config.enabled ? 'ON' : 'OFF'}
      </Typography>
      <Chip 
        label={`Level: ${config.level}`} 
        size="small" 
        color={config.enabled ? 'success' : 'default'}
        sx={{ fontSize: '10px' }}
      />
    </Box>
  );
};

export default LogConfig;

