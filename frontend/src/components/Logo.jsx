import React from 'react';
import { Box } from '@mui/material';
import dominusLogo from '../dominus.png';
import dominusLogoLarge from '../dominus-logo.png';
import { UI_CONFIG } from '../constants';

const Logo = ({ variant = 'header', ...props }) => {
  const size = UI_CONFIG.LOGO_SIZE[variant.toUpperCase()] || UI_CONFIG.LOGO_SIZE.HEADER;
  
  // Choose the correct logo file depending on variant
  const logoSrc = variant === 'header' ? dominusLogoLarge : dominusLogo;
  
  return (
    <Box
      component="img"
      src={logoSrc}
      alt="Dominus Logo"
      sx={{
        ...props.sx,
        ...size,
      }}
      {...props}
    />
  );
};

export default Logo; 