import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Header, Toolbar, ServicesTable, BulkSelectError, ProgressBar, BulkProgressBar, ErrorDialog } from './components';
import { useServices } from './hooks';
import { UI_CONFIG } from './constants';
import { safeDisplayText } from './utils/security';
import { logDebug, logSecure } from './utils/logger';

export default function MainPage({ token, authMethod, onLogout }) {
  logSecure('MainPage render', { 
    hasToken: !!token, 
    authMethod 
  });
  
  const {
    loading,
    error,
    errorDialog,
    action,
    bulkEdit,
    bulkSelection,
    bulkApplying,
    filter,
    bulkSelectError,
    statusesLoading,
    priorityLoading,
    bulkProgress,
    fetchStatuses,
    makePrimary,
    makeSecondary,
    getServicePrimaryMode,
    closeErrorDialog,
    startBulkEdit,
    selectBulkItem,
    applyBulkChanges,
    cancelBulkEdit,
    selectAllBulk,
    setFilter,
    getFilteredRows,
  } = useServices(token, authMethod);

  const rows = getFilteredRows();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={UI_CONFIG.TABLE_CONFIG.MAX_WIDTH} mx="auto" mt={4}>
      <Header onLogout={onLogout} />
      
      <Toolbar
        onRefresh={fetchStatuses}
        onBulkEdit={startBulkEdit}
        onBulkApply={applyBulkChanges}
        onBulkCancel={cancelBulkEdit}
        onBulkSelectAll={selectAllBulk}
        bulkEdit={bulkEdit}
        bulkApplying={bulkApplying}
        bulkSelection={bulkSelection}
        filter={filter}
        onFilterChange={setFilter}
        statusesLoading={statusesLoading}
      />
      
      <BulkSelectError errorServices={bulkSelectError} />
      
      {error && (
        <Typography color="error" mb={2}>
          {safeDisplayText(error)}
        </Typography>
      )}
      
      <ServicesTable
        rows={rows}
        bulkEdit={bulkEdit}
        bulkSelection={bulkSelection}
        onBulkSelect={selectBulkItem}
        onMakePrimary={makePrimary}
        onMakeSecondary={makeSecondary}
        getServicePrimaryMode={getServicePrimaryMode}
        action={action}
        priorityLoading={priorityLoading}
      />
      
      {/* Progress bars */}
      <ProgressBar 
        isLoading={statusesLoading} 
        message="Updating service statuses..." 
      />
      <ProgressBar 
        isLoading={priorityLoading} 
        message="Changing service priority..." 
      />
      <BulkProgressBar 
        isLoading={bulkProgress.isLoading}
        totalItems={bulkProgress.totalItems}
        completedItems={bulkProgress.completedItems}
        failedItems={bulkProgress.failedItems}
        currentItem={bulkProgress.currentItem}
      />
      
      {/* Error dialogs */}
      <ErrorDialog 
        open={!!errorDialog}
        error={errorDialog}
        onClose={closeErrorDialog}
        title="Priority change error"
      />
    </Box>
  );
}