// src/config/api.js
// Centralized API configuration

/**
 * Get the API base URL based on environment
 * In development with Vite proxy, use relative URLs
 * In production, use the full API URL
 */
export const getApiBaseUrl = () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development';
  
  // In development, use relative URLs (Vite proxy will handle routing)
  if (isDevelopment) {
    return '';
  }
  
  // In production, use environment variable or default
  return import.meta.env.VITE_API_URL || '';
};

/**
 * API configuration object
 */
export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
    GOOGLE: '/api/auth/google',
    FACEBOOK: '/api/auth/facebook',
  },
  
  // Hive endpoints
  HIVES: {
    BASE: '/api/hives',
    BY_ID: (id) => `/api/hives/${id}`,
    BOXES: (hiveId) => `/api/hives/${hiveId}/boxes`,
    BOX_BY_ID: (hiveId, boxId) => `/api/hives/${hiveId}/boxes/${boxId}`,
  },
  
  // Apiary endpoints
  APIARIES: {
    BASE: '/api/apiaries',
    BY_ID: (id) => `/api/apiaries/${id}`,
  },
  
  // Inspection endpoints
  INSPECTIONS: {
    BASE: '/api/inspections',
    BY_ID: (id) => `/api/inspections/${id}`,
    BY_HIVE: (hiveId) => `/api/hives/${hiveId}/inspections`,
  },
  
  // Treatment endpoints
  TREATMENTS: {
    BASE: '/api/treatments',
    BY_ID: (id) => `/api/treatments/${id}`,
    BY_HIVE: (hiveId) => `/api/hives/${hiveId}/treatments`,
  },
  
  // Feeding endpoints
  FEEDINGS: {
    BASE: '/api/feedings',
    BY_ID: (id) => `/api/feedings/${id}`,
    BY_HIVE: (hiveId) => `/api/hives/${hiveId}/feedings`,
  },
  
  // Voice processing
  VOICE: {
    PROCESS: '/api/voice/process',
    COMMAND: '/api/voice/command',
  },
};

export default API_CONFIG;