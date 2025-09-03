import React from 'react';
import { Stack, Button, TextField, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { USER_MESSAGES } from '../constants';

const Toolbar = ({
  onRefresh,
  onBulkEdit,
  onBulkApply,
  onBulkCancel,
  onBulkSelectAll,
  bulkEdit,
  bulkApplying,
  bulkSelection,
  filter,
  onFilterChange,
  statusesLoading,
}) => {
  return (
    <Stack direction="row" spacing={2} mb={2} alignItems="center">
      <Button 
        variant="contained" 
        startIcon={statusesLoading ? <CircularProgress size={20} /> : <RefreshIcon />} 
        onClick={onRefresh} 
        disabled={statusesLoading}
        size="medium"
      >
        {statusesLoading ? 'Updating...' : USER_MESSAGES.REFRESH_STATUSES}
      </Button>
      
      {!bulkEdit && (
        <Button 
          variant="contained" 
          color="info" 
          startIcon={<EditIcon />} 
          onClick={onBulkEdit} 
          size="medium"
        >
          {USER_MESSAGES.BULK_EDIT}
        </Button>
      )}
      
      {bulkEdit && (
        <>
          <Button
            variant="contained"
            color="success"
            startIcon={<DoneIcon />}
            onClick={onBulkApply}
            disabled={bulkApplying || Object.values(bulkSelection).every(data => {
              if (Array.isArray(data)) {
                return data.length === 0;
              } else if (typeof data === 'object' && data !== null) {
                return Object.keys(data).length === 0;
              }
              return true;
            })}
            size="medium"
          >
            {USER_MESSAGES.APPLY}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CloseIcon />}
            onClick={onBulkCancel}
            disabled={bulkApplying}
            size="medium"
          >
            {USER_MESSAGES.CANCEL}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={onBulkSelectAll}
            disabled={bulkApplying}
            size="medium"
          >
            {USER_MESSAGES.SELECT_ALL}
          </Button>
        </>
      )}
      
      <TextField
        label={USER_MESSAGES.FILTER_PLACEHOLDER}
        size="small"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        sx={{ minWidth: 250, ml: 'auto' }}
      />
    </Stack>
  );
};

export default Toolbar; 