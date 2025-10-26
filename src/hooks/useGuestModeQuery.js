/**
 * Guest Mode Query Hook
 * 
 * Provides a unified interface for data fetching that works in both
 * guest mode (localStorage) and authenticated mode (API).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGuestMode } from '../context/GuestModeContext';
import { useAuthContext } from '../context/AuthContext';

/**
 * Unified query hook that works in both guest and authenticated modes
 */
export function useGuestModeQuery({
  queryKey,
  queryFn,
  guestCollection,
  guestFilter,
  ...options
}) {
  const { isGuestMode, guestOperations } = useGuestMode();
  const { user } = useAuthContext();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isGuestMode) {
        // Guest mode: fetch from localStorage
        const data = guestFilter
          ? guestOperations.query(guestCollection, guestFilter)
          : guestOperations.getAll(guestCollection);
        return data;
      } else {
        // Authenticated mode: fetch from API
        return await queryFn();
      }
    },
    enabled: isGuestMode || !!user,
    ...options,
  });
}

/**
 * Unified mutation hook that works in both guest and authenticated modes
 */
export function useGuestModeMutation({
  mutationFn,
  guestCollection,
  guestOperation, // 'create', 'update', 'delete'
  invalidateKeys = [],
  ...options
}) {
  const { isGuestMode, guestOperations } = useGuestMode();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables) => {
      if (isGuestMode) {
        // Guest mode: operate on localStorage
        switch (guestOperation) {
          case 'create':
            return guestOperations.create(guestCollection, variables);
          case 'update':
            guestOperations.update(guestCollection, variables.id, variables.data);
            return guestOperations.getById(guestCollection, variables.id);
          case 'delete':
            guestOperations.delete(guestCollection, variables.id || variables);
            return { success: true };
          default:
            throw new Error(`Unknown guest operation: ${guestOperation}`);
        }
      } else {
        // Authenticated mode: call API
        return await mutationFn(variables);
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate queries
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      
      // Call original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

/**
 * Hook for hives with guest mode support
 */
export function useGuestModeHives(apiaryId) {
  const { isGuestMode, guestOperations } = useGuestMode();
  
  return useGuestModeQuery({
    queryKey: ['hives', apiaryId],
    queryFn: async () => {
      const response = await fetch(`/api/hives?apiaryId=${apiaryId}`);
      if (!response.ok) throw new Error('Failed to fetch hives');
      return response.json();
    },
    guestCollection: 'hives',
    guestFilter: apiaryId ? (hive => hive.apiaryId === apiaryId) : null,
  });
}

/**
 * Hook for apiaries with guest mode support
 */
export function useGuestModeApiaries() {
  return useGuestModeQuery({
    queryKey: ['apiaries'],
    queryFn: async () => {
      const response = await fetch('/api/apiaries');
      if (!response.ok) throw new Error('Failed to fetch apiaries');
      return response.json();
    },
    guestCollection: 'apiaries',
  });
}

/**
 * Hook for inspections with guest mode support
 */
export function useGuestModeInspections(hiveId) {
  return useGuestModeQuery({
    queryKey: ['inspections', hiveId],
    queryFn: async () => {
      const response = await fetch(`/api/inspections?hiveId=${hiveId}`);
      if (!response.ok) throw new Error('Failed to fetch inspections');
      return response.json();
    },
    guestCollection: 'inspections',
    guestFilter: hiveId ? (inspection => inspection.hiveId === hiveId) : null,
  });
}

/**
 * Hook for treatments with guest mode support
 */
export function useGuestModeTreatments(hiveId) {
  return useGuestModeQuery({
    queryKey: ['treatments', hiveId],
    queryFn: async () => {
      const response = await fetch(`/api/treatments?hiveId=${hiveId}`);
      if (!response.ok) throw new Error('Failed to fetch treatments');
      return response.json();
    },
    guestCollection: 'treatments',
    guestFilter: hiveId ? (treatment => treatment.hiveId === hiveId) : null,
  });
}

/**
 * Hook for feedings with guest mode support
 */
export function useGuestModeFeedings(hiveId) {
  return useGuestModeQuery({
    queryKey: ['feedings', hiveId],
    queryFn: async () => {
      const response = await fetch(`/api/feedings?hiveId=${hiveId}`);
      if (!response.ok) throw new Error('Failed to fetch feedings');
      return response.json();
    },
    guestCollection: 'feedings',
    guestFilter: hiveId ? (feeding => feeding.hiveId === hiveId) : null,
  });
}