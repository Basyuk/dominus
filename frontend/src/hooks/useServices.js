import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../utils/api';
import { ERROR_MESSAGES } from '../constants';
import { sanitizeServiceData, sanitizeServicesArray } from '../utils/security';
import { logInfo, logError, logDebug, logSecure, logWarn } from '../utils/logger';

export const useServices = (token, authMethod) => {
  const [services, setServices] = useState({});
  const [statuses, setStatuses] = useState({});
  const [serviceConfigs, setServiceConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDialog, setErrorDialog] = useState(null);
  const [action, setAction] = useState(null);
  const [bulkEdit, setBulkEdit] = useState(false);
  const [bulkSelection, setBulkSelection] = useState({});
  const [bulkApplying, setBulkApplying] = useState(false);
  const [filter, setFilter] = useState('');
  const [bulkSelectError, setBulkSelectError] = useState([]);
  
  // Progress states
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({
    isLoading: false,
    totalItems: 0,
    completedItems: 0,
    failedItems: 0,
    currentItem: '',
    results: []
  });

  // Get primary_mode for service
  const getServicePrimaryMode = useCallback((serviceName) => {
    return serviceConfigs[serviceName]?.primary_mode || 'only_one';
  }, [serviceConfigs]);

  // Load services
  const fetchServices = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getServices(token, authMethod);
      if (data) {
        // Sanitize service data
        const sanitizedData = {};
        Object.entries(data).forEach(([service, urls]) => {
          if (Array.isArray(urls)) {
            sanitizedData[sanitizeServiceData({ service }).service] = urls.map(url => 
              sanitizeServiceData({ url }).url
            );
          }
        });
        setServices(sanitizedData);
        logInfo('Services loaded successfully', { 
          serviceCount: Object.keys(sanitizedData).length 
        });
      }
    } catch (error) {
      logError('Failed to load services', { error: error.message });
      setError(ERROR_MESSAGES.SERVICES_LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, [token, authMethod]);

  // Load statuses
  const fetchStatuses = useCallback(async () => {
    if (!token) return;
    
    setStatusesLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getStatuses(token, authMethod);
      if (data) {
        // Sanitize status data
        const sanitizedData = {};
        Object.entries(data).forEach(([service, statuses]) => {
          if (Array.isArray(statuses)) {
            sanitizedData[sanitizeServiceData({ service }).service] = statuses.map(status => 
              sanitizeServiceData(status)
            );
          }
        });
        setStatuses(sanitizedData);
        logInfo('Statuses loaded successfully', { 
          serviceCount: Object.keys(sanitizedData).length 
        });
      }
    } catch (error) {
      logError('Failed to load statuses', { error: error.message });
      setError(ERROR_MESSAGES.STATUSES_LOAD_ERROR);
    } finally {
      setStatusesLoading(false);
    }
  }, [token, authMethod]);

  // Load service configurations
  const fetchServiceConfigs = useCallback(async () => {
    if (!token) return;
    
    try {
      const data = await apiService.getServiceConfigs(token, authMethod);
      if (data) {
        setServiceConfigs(data);
        logInfo('Service configs loaded successfully', { 
          configCount: Object.keys(data).length 
        });
      }
    } catch (error) {
      logError('Failed to load service configs', { error: error.message });
      // Don't set error as this is not critical - just use default settings
    }
  }, [token, authMethod]);

  // Change service priority
  const makePrimary = useCallback(async (service, url) => {
    logInfo('makePrimary called', { service, url, authMethod });
    
    if (!token) {
      logWarn('makePrimary: No token provided');
      return;
    }
    
    if (!service || !url) {
      logWarn('makePrimary: Missing service or url', { service, url });
      setErrorDialog('Service or URL data is missing');
      return;
    }
    
    setAction(`${service}:${url}`);
    setPriorityLoading(true);
    setError(null);
    
    try {
      const data = await apiService.updatePriority(token, service, url, authMethod);
      if (data && data.success) {
        logInfo('Priority updated successfully', { service, url });
        await fetchStatuses();
      } else if (data && data.message) {
        logWarn('Priority update failed', { service, url, message: data.message });
        setErrorDialog(data.message || ERROR_MESSAGES.PRIORITY_CHANGE_ERROR);
      }
    } catch (error) {
      // Use error message from server if available
      const errorMessage = error.message || ERROR_MESSAGES.CONNECTION_ERROR;
      logError('Priority update error', { service, url, error: errorMessage });
      setErrorDialog(errorMessage);
    } finally {
      setAction(null);
      setPriorityLoading(false);
    }
  }, [token, authMethod, fetchStatuses]);

  // Set secondary status (for many mode)
  const makeSecondary = useCallback(async (service, url) => {
    logInfo('makeSecondary called', { service, url, authMethod });
    
    if (!token) {
      logWarn('makeSecondary: No token provided');
      return;
    }
    
    if (!service || !url) {
      logWarn('makeSecondary: Missing service or url', { service, url });
      setErrorDialog('Service or URL data is missing');
      return;
    }
    
    setAction(`${service}:${url}:secondary`);
    setPriorityLoading(true);
    setError(null);
    
    try {
      const data = await apiService.setSecondary(token, service, url, authMethod);
      if (data && data.success) {
        logInfo('Secondary status set successfully', { service, url });
        await fetchStatuses();
      } else if (data && data.message) {
        logWarn('Set secondary failed', { service, url, message: data.message });
        setErrorDialog(data.message || ERROR_MESSAGES.PRIORITY_CHANGE_ERROR);
      }
    } catch (error) {
      const errorMessage = error.message || ERROR_MESSAGES.CONNECTION_ERROR;
      logError('Set secondary error', { service, url, error: errorMessage });
      setErrorDialog(errorMessage);
    } finally {
      setAction(null);
      setPriorityLoading(false);
    }
  }, [token, authMethod, fetchStatuses]);

  // Bulk update
  const startBulkEdit = useCallback(() => {
    setBulkEdit(true);
    setBulkSelectError([]);
    
    // Pre-fill selected with current statuses
    const selection = {};
    Object.entries(statuses).forEach(([service, arr]) => {
      const primaryMode = serviceConfigs[service]?.primary_mode || 'only_one';
      
      if (primaryMode === 'many') {
        // For many mode - preserve current server statuses
        const serverStatuses = {};
        if (Array.isArray(arr)) {
          arr.forEach(server => {
            if (server.status === 'primary' || server.status === 'secondary') {
              serverStatuses[server.url] = server.status;
            }
            // For other statuses (noset etc.) preset to primary
            else {
              serverStatuses[server.url] = 'primary';
            }
          });
        }
        if (Object.keys(serverStatuses).length > 0) {
          selection[service] = serverStatuses;
        }
      } else {
        // For only_one mode - select one primary server (as before)
        const primary = Array.isArray(arr) && arr.find(s => s.status === 'primary');
        if (primary) selection[service] = [primary.url];
      }
    });
    setBulkSelection(selection);
    logInfo('Bulk edit started', { 
      selectedServices: Object.keys(selection).length 
    });
  }, [statuses, serviceConfigs]);

  const selectBulkItem = useCallback((service, url, targetStatus = null) => {
    const primaryMode = serviceConfigs[service]?.primary_mode || 'only_one';
    
    setBulkSelection(sel => {
      if (primaryMode === 'many') {
        // For many mode - manage server status
        const currentServiceSelection = sel[service] || {};
        const newServiceSelection = { ...currentServiceSelection };
        
        // Set status (should always be primary or secondary)
        newServiceSelection[url] = targetStatus;
        
        logDebug('Bulk item status changed (many mode)', { service, url, targetStatus, newServiceSelection });
        
        return { ...sel, [service]: newServiceSelection };
      } else {
        // For only_one mode - replace selection (as before)
        const currentSelection = sel[service] || [];
        const isSelected = currentSelection.includes(url);
        
        logDebug('Bulk item selected (only_one mode)', { service, url, isSelected });
        
        if (isSelected) {
          // Remove selection
          const newSelection = { ...sel };
          delete newSelection[service];
          return newSelection;
        } else {
          // Add selection
          return { ...sel, [service]: [url] };
        }
      }
    });
  }, [serviceConfigs]);

  const applyBulkChanges = useCallback(async () => {
    if (!token) return;
    
    // Transform structure for processing
    const selectedItems = [];
    Object.entries(bulkSelection).forEach(([service, data]) => {
      const primaryMode = serviceConfigs[service]?.primary_mode || 'only_one';
      
      if (primaryMode === 'many') {
        // For many mode: { service: { url: 'primary'|'secondary' } }
        if (typeof data === 'object' && !Array.isArray(data)) {
          Object.entries(data).forEach(([url, targetStatus]) => {
            selectedItems.push([service, url, targetStatus]);
          });
        }
      } else {
        // For only_one mode: { service: [url] }
        if (Array.isArray(data) && data.length > 0) {
          data.forEach(url => {
            selectedItems.push([service, url, 'primary']); // always primary for only_one
          });
        }
      }
    });
    
    const totalItems = selectedItems.length;
    
    if (totalItems === 0) return;
    
    setBulkApplying(true);
    setBulkProgress({
      isLoading: true,
      totalItems,
      completedItems: 0,
      failedItems: 0,
      currentItem: '',
      results: []
    });
    setError(null);
    
    try {
      const results = [];
      
      for (let i = 0; i < selectedItems.length; i++) {
        const [service, url, targetStatus] = selectedItems[i];
        
        setBulkProgress(prev => ({
          ...prev,
          currentItem: `${service}: ${url} → ${targetStatus}`
        }));
        
        try {
          let result;
          if (targetStatus === 'primary') {
            result = await apiService.updatePriority(token, service, url, authMethod);
          } else if (targetStatus === 'secondary') {
            result = await apiService.setSecondary(token, service, url, authMethod);
          }
          
          results.push({ service, url, targetStatus, success: true, result });
          
          setBulkProgress(prev => ({
            ...prev,
            completedItems: prev.completedItems + 1,
            results: [...prev.results, { service, url, targetStatus, success: true, result }]
          }));
        } catch (error) {
          results.push({ service, url, targetStatus, success: false, error: error.message });
          
          setBulkProgress(prev => ({
            ...prev,
            failedItems: prev.failedItems + 1,
            results: [...prev.results, { service, url, targetStatus, success: false, error: error.message }]
          }));
        }
      }
      
      setBulkEdit(false);
      setBulkSelection({});
      logInfo('Bulk changes applied successfully', { 
        updatedServices: totalItems,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });
      
      await fetchStatuses();
      
      // Show result for 2 seconds
      setTimeout(() => {
        setBulkProgress(prev => ({ ...prev, isLoading: false }));
      }, 2000);
      
    } catch (error) {
      const errorMessage = error.message || ERROR_MESSAGES.BULK_UPDATE_ERROR;
      logError('Bulk update error', { error: errorMessage });
      setError(errorMessage);
      setBulkProgress(prev => ({ ...prev, isLoading: false }));
    } finally {
      setBulkApplying(false);
    }
  }, [token, authMethod, bulkSelection, fetchStatuses]);

  const cancelBulkEdit = useCallback(() => {
    setBulkEdit(false);
    setBulkSelection({});
    logInfo('Bulk edit cancelled');
  }, []);

  const selectAllBulk = useCallback(() => {
    const newSelection = { ...bulkSelection };
    const errorServices = [];
    
    // Get filtered rows directly
    const filterLower = filter.trim().toLowerCase();
    const rows = [];
    
    Object.entries(services).forEach(([service, urls]) => {
      if (!Array.isArray(urls)) return;
      
      const matched = urls
        .map((url) => {
          const st = Array.isArray(statuses[service]) ? statuses[service].find(s => s.url === url) : {};
          const match =
            service.toLowerCase().includes(filterLower) ||
            (st.hostname || '').toLowerCase().includes(filterLower) ||
            (st.status || '').toLowerCase().includes(filterLower);
          
          return match
            ? {
                service,
                url,
                hostname: st.hostname || '-',
                status: st.status || '-',
                isPrimary: st.status === 'primary',
                idx: null,
                count: null
              }
            : null;
        })
        .filter(Boolean);
      
      if (matched.length > 0) {
        matched.forEach((row, i) => {
          row.idx = i;
          row.count = matched.length;
          rows.push(row);
        });
      }
    });
    
    // Group rows by service
    const serviceRows = {};
    rows.forEach(row => {
      if (!serviceRows[row.service]) serviceRows[row.service] = [];
      serviceRows[row.service].push(row);
    });
    
    Object.entries(serviceRows).forEach(([service, serviceRowsArr]) => {
      const primaryMode = serviceConfigs[service]?.primary_mode || 'only_one';
      const notPrimary = serviceRowsArr.filter(row => !row.isPrimary);
      
      if (primaryMode === 'many') {
        // For many mode - set status primary for all non-primary servers
        if (notPrimary.length > 0) {
          const serverStatuses = {};
          notPrimary.forEach(row => {
            serverStatuses[row.url] = 'primary';
          });
          newSelection[service] = serverStatuses;
        }
      } else {
        // For only_one mode - select one non-primary server (as before)
        if (notPrimary.length === 1) {
          newSelection[service] = [notPrimary[0].url];
        } else if (notPrimary.length > 1) {
          errorServices.push(service);
        }
      }
    });
    
    setBulkSelection(newSelection);
    setBulkSelectError(errorServices);
    logInfo('Select all bulk completed', { 
      selectedServices: Object.keys(newSelection).length,
      errorServices: errorServices.length 
    });
  }, [bulkSelection, services, statuses, filter, serviceConfigs]);

  // Getting filtered rows
  const getFilteredRows = useCallback(() => {
    const filterLower = filter.trim().toLowerCase();
    const rows = [];
    
    logDebug('getFilteredRows processing', { 
      filter: filterLower,
      servicesCount: Object.keys(services).length,
      statusesCount: Object.keys(statuses).length 
    });
    
    Object.entries(services).forEach(([service, urls]) => {
      logDebug('Processing service', { service, urlsCount: urls.length });
      if (!Array.isArray(urls)) {
        logWarn('Service urls is not an array', { service, urls });
        return;
      }
      
      const matched = urls
        .map((url) => {
          const st = Array.isArray(statuses[service]) ? statuses[service].find(s => s.url === url) : {};
          const match =
            service.toLowerCase().includes(filterLower) ||
            (st.hostname || '').toLowerCase().includes(filterLower) ||
            (st.status || '').toLowerCase().includes(filterLower);
          
          return match
            ? {
                service,
                url,
                hostname: st.hostname || '-',
                status: st.status || '-',
                isPrimary: st.status === 'primary',
                idx: null,
                count: null
              }
            : null;
        })
        .filter(Boolean);
      
      if (matched.length > 0) {
        matched.forEach((row, i) => {
          row.idx = i;
          row.count = matched.length;
          rows.push(row);
        });
      }
    });
    
    logDebug('getFilteredRows result', { 
      totalRows: rows.length,
      filterApplied: !!filterLower 
    });
    
    return rows;
  }, [services, statuses, filter]);

  // Close error dialog
  const closeErrorDialog = useCallback(() => {
    setErrorDialog(null);
  }, []);

  // Effects
  useEffect(() => {
    fetchServices();
    fetchServiceConfigs();
  }, [fetchServices, fetchServiceConfigs]);

  useEffect(() => {
    if (Object.keys(services).length > 0) {
      fetchStatuses();
    }
  }, [services, fetchStatuses]);

  return {
    // State
    services,
    statuses,
    serviceConfigs,
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
    
    // Methods
    fetchServices,
    fetchStatuses,
    fetchServiceConfigs,
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
  };
}; 