import React from 'react';
import { Box, Typography } from '@mui/material';
import { safeDisplayText } from '../utils/security';

const BulkSelectError = ({ errorServices }) => {
  if (!errorServices || errorServices.length === 0) {
    return null;
  }

  return (
    <Box mb={2} p={2} bgcolor="#fff3cd" borderRadius={2} border="1px solid #ffeeba">
      <Typography color="#856404" fontWeight="bold">
        Failed to auto-select in services:
      </Typography>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {errorServices.map(service => (
          <li key={service}>{safeDisplayText(service)}</li>
        ))}
      </ul>
    </Box>
  );
};

export default BulkSelectError; 