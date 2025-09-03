import React from 'react';
import { 
  Box, 
  LinearProgress, 
  Typography, 
  Fade,
  Paper,
  CircularProgress
} from '@mui/material';

const ProgressBar = ({ 
  isLoading, 
  message = 'Processing request...', 
  showMessage = true,
  variant = 'indeterminate',
  progress = 0,
  showProgress = false,
  type = 'linear' // 'linear' or 'circular'
}) => {
  if (!isLoading) return null;

  return (
    <Fade in={isLoading}>
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          p: 4,
          minWidth: 320,
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box sx={{ width: '100%', mb: 3 }}>
          {type === 'circular' ? (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress 
                variant={variant}
                size={60}
                thickness={4}
                value={showProgress ? progress : undefined}
                sx={{ color: 'primary.main' }}
              />
              {showProgress && variant === 'determinate' && (
                <Box
                  sx={{
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {`${Math.round(progress)}%`}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <LinearProgress 
              variant={variant}
              value={showProgress ? progress : undefined}
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                }
              }}
            />
          )}
        </Box>
        {showMessage && (
          <Typography 
            variant="body1" 
            color="text.primary"
            sx={{ 
              fontWeight: 500,
              mb: showProgress && variant === 'determinate' ? 1 : 0
            }}
          >
            {message}
          </Typography>
        )}
        {showProgress && variant === 'determinate' && (
          <Typography variant="body2" color="text.secondary">
            {`${Math.round(progress)}% completed`}
          </Typography>
        )}
      </Paper>
    </Fade>
  );
};

export default ProgressBar;
