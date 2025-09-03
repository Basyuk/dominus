import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { USER_MESSAGES, UI_CONFIG } from '../constants';
import { safeDisplayText } from '../utils/security';

const ServicesTable = ({
  rows,
  bulkEdit,
  bulkSelection,
  onBulkSelect,
  onMakePrimary,
  onMakeSecondary,
  getServicePrimaryMode,
  action,
  priorityLoading,
}) => {
  // For visual service separation
  const getServiceBorder = (row, i) => {
    if (row.idx === 0 && i !== 0) {
      return { borderTop: UI_CONFIG.TABLE_CONFIG.ROW_SPAN_BORDER };
    }
    return {};
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Service</TableCell>
            <TableCell>Server Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow 
              key={row.url + row.service} 
              sx={{ 
                background: row.isPrimary ? '#e0ffe0' : undefined, 
                ...getServiceBorder(row, i) 
              }}
            >
              {row.idx === 0 && (
                <TableCell 
                  rowSpan={row.count} 
                  sx={{ 
                    fontWeight: 'bold', 
                    background: '#f5f5f5', 
                    ...getServiceBorder(row, i) 
                  }}
                >
                  {row.service}
                </TableCell>
              )}
              <TableCell>{safeDisplayText(row.hostname)}</TableCell>
              <TableCell>{safeDisplayText(row.status)}</TableCell>
              <TableCell align="center">
                {bulkEdit ? (
                  (() => {
                    const primaryMode = getServicePrimaryMode(row.service);
                    
                    if (primaryMode === 'many') {
                      // Many mode: radio buttons for status selection (only primary/secondary)
                      const serviceSelection = bulkSelection[row.service] || {};
                      const currentStatus = serviceSelection[row.url] || '';
                      
                      return (
                        <RadioGroup
                          value={currentStatus}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            onBulkSelect(row.service, row.url, newValue);
                          }}
                          row
                          sx={{ justifyContent: 'center' }}
                        >
                          <FormControlLabel 
                            value="primary" 
                            control={<Radio size="small" />} 
                            label="Primary" 
                            sx={{ margin: '0 8px' }}
                          />
                          <FormControlLabel 
                            value="secondary" 
                            control={<Radio size="small" />} 
                            label="Secondary" 
                            sx={{ margin: '0 8px' }}
                          />
                        </RadioGroup>
                      );
                    } else {
                      // Only_one mode: radio buttons for "make primary" selection
                      const selectedUrls = bulkSelection[row.service] || [];
                      const isSelected = selectedUrls.includes(row.url);
                      
                      return (
                        <Radio
                          checked={isSelected}
                          disabled={row.isPrimary}
                          onChange={() => onBulkSelect(row.service, row.url)}
                          name={`bulk-${row.service}`}
                          color="primary"
                        />
                      );
                    }
                  })()
                ) : (
                  (() => {
                    const primaryMode = getServicePrimaryMode(row.service);
                    const isSecondary = row.status === 'secondary';
                    const isNoSet = row.status !== 'primary' && row.status !== 'secondary';
                    
                    if (primaryMode === 'many') {
                      // Many mode: show two buttons depending on status
                      return (
                        <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                          {/* "Make Primary" button - active if status is not primary or if noset */}
                          <Button
                            variant={row.isPrimary ? "contained" : "outlined"}
                            size="small"
                            disabled={
                              action === `${row.service}:${row.url}` || 
                              (row.isPrimary && !isNoSet) || 
                              priorityLoading
                            }
                            onClick={() => onMakePrimary(row.service, row.url)}
                            startIcon={
                              action === `${row.service}:${row.url}` ? (
                                <CircularProgress size={16} />
                              ) : null
                            }
                            sx={{ minWidth: '80px', fontSize: '0.75rem' }}
                          >
                            {action === `${row.service}:${row.url}` ? 'Processing...' : 'Primary'}
                          </Button>
                          
                          {/* "Make Secondary" button - active if status is not secondary or if noset */}
                          <Button
                            variant={isSecondary ? "contained" : "outlined"}
                            size="small"
                            disabled={
                              action === `${row.service}:${row.url}:secondary` || 
                              (isSecondary && !isNoSet) || 
                              priorityLoading
                            }
                            onClick={() => onMakeSecondary(row.service, row.url)}
                            startIcon={
                              action === `${row.service}:${row.url}:secondary` ? (
                                <CircularProgress size={16} />
                              ) : null
                            }
                            sx={{ minWidth: '80px', fontSize: '0.75rem' }}
                          >
                            {action === `${row.service}:${row.url}:secondary` ? 'Processing...' : 'Second.'}
                          </Button>
                        </Box>
                      );
                    } else {
                      // Only_one mode: one button as before
                      return (
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={action === `${row.service}:${row.url}` || row.isPrimary || priorityLoading}
                          onClick={() => onMakePrimary(row.service, row.url)}
                          startIcon={
                            action === `${row.service}:${row.url}` ? (
                              <CircularProgress size={16} />
                            ) : null
                          }
                        >
                          {action === `${row.service}:${row.url}` ? 'Processing...' : USER_MESSAGES.MAKE_PRIMARY}
                        </Button>
                      );
                    }
                  })()
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ServicesTable; 