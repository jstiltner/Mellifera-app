/**
 * useServiceStatus Hook
 * 
 * Fetches and provides service availability status to components.
 * Allows UI to adapt based on which AI services are configured.
 */

import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/api';

/**
 * Fetch service status from backend
 */
async function fetchServiceStatus() {
  const response = await fetch(`${API_BASE_URL}/services/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch service status');
  }
  return response.json();
}

/**
 * Fetch available features based on service configuration
 */
async function fetchAvailableFeatures() {
  const response = await fetch(`${API_BASE_URL}/services/features`);
  if (!response.ok) {
    throw new Error('Failed to fetch available features');
  }
  return response.json();
}

/**
 * Hook to get service status
 */
export function useServiceStatus() {
  return useQuery({
    queryKey: ['serviceStatus'],
    queryFn: fetchServiceStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get available features
 */
export function useAvailableFeatures() {
  return useQuery({
    queryKey: ['availableFeatures'],
    queryFn: fetchAvailableFeatures,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to check if a specific feature is available
 */
export function useFeatureAvailability(featureName) {
  const { data, isLoading } = useAvailableFeatures();
  
  return {
    isAvailable: data?.features?.[featureName] ?? false,
    isLoading,
    features: data?.features,
    serviceStatus: data?.serviceStatus,
  };
}

/**
 * Hook to check if any AI service is available
 */
export function useHasAI() {
  const { data, isLoading } = useServiceStatus();
  
  return {
    hasAI: data?.hasAnyAI ?? false,
    isLoading,
    services: data?.services,
    message: data?.message,
  };
}