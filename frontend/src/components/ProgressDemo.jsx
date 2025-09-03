import React, { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ProgressBar, BulkProgressBar } from './index';

const ProgressDemo = () => {
  const [showSimpleProgress, setShowSimpleProgress] = useState(false);
  const [showBulkProgress, setShowBulkProgress] = useState(false);
  const [bulkState, setBulkState] = useState({
    totalItems: 5,
    completedItems: 0,
    failedItems: 0,
    currentItem: ''
  });

  const handleSimpleProgress = () => {
    setShowSimpleProgress(true);
    setTimeout(() => setShowSimpleProgress(false), 3000);
  };

  const handleBulkProgress = () => {
    setShowBulkProgress(true);
    setBulkState({
      totalItems: 5,
      completedItems: 0,
      failedItems: 0,
      currentItem: ''
    });

    // Progress simulation
    let completed = 0;
    let failed = 0;
    const items = ['Service A', 'Service B', 'Service C', 'Service D', 'Service E'];

    const interval = setInterval(() => {
      if (completed + failed < items.length) {
        const currentItem = items[completed + failed];
        setBulkState(prev => ({
          ...prev,
          currentItem: `${currentItem}: http://example.com`
        }));

        setTimeout(() => {
          if (Math.random() > 0.2) { // 80% success
            completed++;
            setBulkState(prev => ({
              ...prev,
              completedItems: completed,
              currentItem: ''
            }));
          } else {
            failed++;
            setBulkState(prev => ({
              ...prev,
              failedItems: failed,
              currentItem: ''
            }));
          }
        }, 1000);
      } else {
        clearInterval(interval);
        setTimeout(() => setShowBulkProgress(false), 2000);
      }
    }, 1500);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Progress Bars Demo
      </Typography>
      
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Simple Progress Bar
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleSimpleProgress}
            disabled={showSimpleProgress}
          >
            Show Simple Progress
          </Button>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Detailed progress bar for bulk operations
          </Typography>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={handleBulkProgress}
            disabled={showBulkProgress}
          >
            Show Bulk Progress
          </Button>
        </Box>
      </Stack>

      {/* Progress bars */}
      <ProgressBar 
        isLoading={showSimpleProgress}
        message="Performing test request..."
        type="circular"
      />
      
      <BulkProgressBar 
        isLoading={showBulkProgress}
        totalItems={bulkState.totalItems}
        completedItems={bulkState.completedItems}
        failedItems={bulkState.failedItems}
        currentItem={bulkState.currentItem}
      />
    </Box>
  );
};

export default ProgressDemo;