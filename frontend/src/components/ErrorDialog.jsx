import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
import { safeDisplayText } from '../utils/security';

const ErrorDialog = ({ open, error, onClose, title = "Error" }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="error-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>An error occurred</AlertTitle>
          <DialogContentText id="error-dialog-description">
            {safeDisplayText(error)}
          </DialogContentText>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
