/**
 * API Configuration Hook
 * Automatically switches between localhost and production URLs based on environment
 */

// Determine the backend URL based on the environment
const getBackendUrl = (): string => {
  // If running in production (deployed), use the production URL
  if (import.meta.env.PROD) {
    // Check if a production URL is set in environment variables
    const prodUrl = import.meta.env.VITE_REACT_APP_API_URL;
    if (prodUrl) {
      return prodUrl;
    }
    // Default production URL
    return 'https://lixeta.onrender.com';
  }

  // Development: use localhost
  const devUrl = import.meta.env.VITE_REACT_APP_API_URL;
  if (devUrl) {
    return devUrl;
  }
  return 'http://localhost:3000';
};

export const API_CONFIG = {
  baseUrl: getBackendUrl(),
  endpoints: {
    'dual-time': '/api/demo/dual-time',
    'behavior-reminder': '/api/demo/behavior-reminder',
    'fintech-login': '/api/demo/fintech-login',
    'active-hours': '/api/demo/active-hours'
  }
};

/**
 * React Hook: useApiUrl
 * Returns the current API base URL
 * Can be used in components to dynamically display or use the API URL
 */
export const useApiUrl = (): string => {
  return API_CONFIG.baseUrl;
};

/**
 * Helper function to build full API endpoint URL
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};

/**
 * Helper function to get endpoint path
 */
export const getEndpointPath = (scenario: string): string | undefined => {
  return API_CONFIG.endpoints[scenario as keyof typeof API_CONFIG.endpoints];
};
