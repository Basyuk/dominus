import React, { useState, useEffect } from 'react';
import { 
  Box, 
  LinearProgress, 
  Typography, 
  Fade,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { CheckCircle, Error, Pending } from '@mui/icons-material';

const BulkProgressBar = ({ 
  isLoading, 
  totalItems = 0,
  completedItems = 0,
  failedItems = 0,
  currentItem = '',
  onComplete
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (totalItems > 0) {
      const calculatedProgress = ((completedItems + failedItems) / totalItems) * 100;
      setProgress(calculatedProgress);
      
      if (calculatedProgress >= 100 && onComplete) {
        setTimeout(onComplete, 1000); // Small delay to show result
      }
    }
  }, [completedItems, failedItems, totalItems, onComplete]);

  if (!isLoading) return null;

  const pendingItems = totalItems - completedItems - failedItems;
  const isComplete = progress >= 100;

  return (
    <Fade in={isLoading}>
      <Paper 
        elevation={4} 
        sx={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          p: 4,
          minWidth: 400,
          maxWidth: 500,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(15px)'
        }}
      >
        <Typography 
          variant="h6" 
          color="text.primary"
          sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}
        >
          {isComplete ? 'Bulk update completed' : 'Bulk priority update'}
        </Typography>

        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress 
            variant="determinate"
            value={progress}
            sx={{ 
              height: 12, 
              borderRadius: 6,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                backgroundColor: isComplete && failedItems === 0 ? '#4caf50' : '#1976d2'
              }
            }}
          />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 1, textAlign: 'center' }}
          >
            {`${Math.round(progress)}% completed (${completedItems + failedItems}/${totalItems})`}
          </Typography>
        </Box>

        {currentItem && !isComplete && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 2, textAlign: 'center', fontStyle: 'italic' }}
          >
            Processing: {currentItem}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              {completedItems}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Success
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="error.main">
              {failedItems}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Errors
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {pendingItems}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pending
            </Typography>
          </Box>
        </Box>

        {isComplete && (
          <Box sx={{ mt: 2 }}>
            <Typography 
              variant="body2" 
              color={failedItems === 0 ? "success.main" : "warning.main"}
              sx={{ textAlign: 'center', fontWeight: 500 }}
            >
              {failedItems === 0 
                ? 'All operations completed successfully!' 
                : `Completed with ${failedItems} error(s)`
              }
            </Typography>
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default BulkProgressBar;

