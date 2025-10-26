// src/utils/errorHandler.js
// Centralized error handling utilities

import { toast } from 'react-toastify';

/**
 * Error types for better categorization
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Determine error type from error object
 */
export const getErrorType = (error) => {
  if (!error.response) {
    return ErrorTypes.NETWORK;
  }

  const status = error.response?.status;
  
  if (status === 401 || status === 403) {
    return ErrorTypes.AUTH;
  }
  
  if (status === 404) {
    return ErrorTypes.NOT_FOUND;
  }
  
  if (status === 400 || status === 422) {
    return ErrorTypes.VALIDATION;
  }
  
  if (status >= 500) {
    return ErrorTypes.SERVER;
  }
  
  return ErrorTypes.UNKNOWN;
};

/**
 * Extract user-friendly error message
 */
export const getErrorMessage = (error, fallbackMessage = 'An unexpected error occurred') => {
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle axios errors
  if (error.response) {
    const { data, status } = error.response;
    
    // Try to get message from response data
    if (data?.message) {
      return data.message;
    }
    
    if (data?.error) {
      return data.error;
    }
    
    // Default messages based on status code
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'You are not authorized. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Request failed with status ${status}`;
    }
  }

  // Handle network errors
  if (error.request) {
    return 'Network error. Please check your connection.';
  }

  // Handle Error objects
  if (error.message) {
    return error.message;
  }

  return fallbackMessage;
};

/**
 * Show error toast notification
 */
export const showErrorToast = (error, customMessage) => {
  const message = customMessage || getErrorMessage(error);
  const errorType = getErrorType(error);
  
  const toastOptions = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  // Customize based on error type
  if (errorType === ErrorTypes.AUTH) {
    toast.error(message, { ...toastOptions, autoClose: 7000 });
  } else if (errorType === ErrorTypes.NETWORK) {
    toast.error(message, { ...toastOptions, autoClose: false });
  } else {
    toast.error(message, toastOptions);
  }
};

/**
 * Show success toast notification
 */
export const showSuccessToast = (message) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show info toast notification
 */
export const showInfoToast = (message) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show warning toast notification
 */
export const showWarningToast = (message) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Handle API errors with logging and user notification
 */
export const handleApiError = (error, context = '') => {
  // Log error for debugging
  console.error(`API Error${context ? ` in ${context}` : ''}:`, {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    type: getErrorType(error),
  });

  // Show user-friendly notification
  showErrorToast(error);
  
  // Return error details for further handling if needed
  return {
    type: getErrorType(error),
    message: getErrorMessage(error),
    originalError: error,
  };
};

/**
 * Create a standardized error handler for React Query mutations
 */
export const createMutationErrorHandler = (context) => {
  return (error) => {
    handleApiError(error, context);
  };
};

/**
 * Create a standardized success handler for React Query mutations
 */
export const createMutationSuccessHandler = (message) => {
  return () => {
    showSuccessToast(message);
  };
};

// Export legacy functions for backward compatibility
export const errorToast = showErrorToast;
export const successToast = showSuccessToast;

export default {
  ErrorTypes,
  getErrorType,
  getErrorMessage,
  showErrorToast,
  showSuccessToast,
  showInfoToast,
  showWarningToast,
  handleApiError,
  createMutationErrorHandler,
  createMutationSuccessHandler,
  // Legacy exports
  errorToast,
  successToast,
};