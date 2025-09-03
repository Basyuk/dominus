// Data utilities

// Transform service data into table rows
export const transformServicesToRows = (services, statuses, filter = '') => {
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
  
  return rows;
};

// Group rows by services
export const groupRowsByService = (rows) => {
  const serviceGroups = {};
  
  rows.forEach(row => {
    if (!serviceGroups[row.service]) {
      serviceGroups[row.service] = [];
    }
    serviceGroups[row.service].push(row);
  });
  
  return serviceGroups;
};

// Get primary services
export const getPrimaryServices = (statuses) => {
  const primary = {};
  
  Object.entries(statuses).forEach(([service, arr]) => {
    if (Array.isArray(arr)) {
      const primaryService = arr.find(s => s.status === 'primary');
      if (primaryService) {
        primary[service] = primaryService.url;
      }
    }
  });
  
  return primary;
};

// Filter services by status
export const filterServicesByStatus = (services, statuses, statusFilter) => {
  if (!statusFilter) return services;
  
  const filtered = {};
  
  Object.entries(services).forEach(([service, urls]) => {
    const serviceStatuses = statuses[service];
    if (Array.isArray(serviceStatuses)) {
      const hasMatchingStatus = serviceStatuses.some(s => s.status === statusFilter);
      if (hasMatchingStatus) {
        filtered[service] = urls;
      }
    }
  });
  
  return filtered;
};

// Sort services by name
export const sortServicesByName = (services) => {
  return Object.keys(services).sort().reduce((sorted, key) => {
    sorted[key] = services[key];
    return sorted;
  }, {});
};

// Calculate services statistics
export const getServicesStats = (services, statuses) => {
  let totalServices = 0;
  let totalInstances = 0;
  let primaryCount = 0;
  let secondaryCount = 0;
  let unknownCount = 0;
  
  Object.entries(services).forEach(([service, urls]) => {
    if (Array.isArray(urls)) {
      totalServices++;
      totalInstances += urls.length;
      
      const serviceStatuses = statuses[service];
      if (Array.isArray(serviceStatuses)) {
        serviceStatuses.forEach(status => {
          switch (status.status) {
            case 'primary':
              primaryCount++;
              break;
            case 'secondary':
              secondaryCount++;
              break;
            default:
              unknownCount++;
              break;
          }
        });
      }
    }
  });
  
  return {
    totalServices,
    totalInstances,
    primaryCount,
    secondaryCount,
    unknownCount
  };
}; 