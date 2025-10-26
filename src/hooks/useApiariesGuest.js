/**
 * Guest-Mode Compatible Apiaries Hook
 * 
 * Wrapper around useApiaries that works in both guest and authenticated modes
 */

import { useGuestMode } from '../context/GuestModeContext';
import { useGuestModeQuery, useGuestModeMutation } from './useGuestModeQuery';
import { useAuthContext } from '../context/AuthContext';
import axios from 'axios';

export const useApiaries = () => {
  const { token } = useAuthContext();
  const { isGuestMode } = useGuestMode();

  return useGuestModeQuery({
    queryKey: ['apiaries'],
    queryFn: async () => {
      const response = await axios.get('/api/apiaries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    guestCollection: 'apiaries',
    enabled: isGuestMode || !!token,
  });
};

export const useCreateApiary = () => {
  const { token } = useAuthContext();

  return useGuestModeMutation({
    mutationFn: async (newApiary) => {
      const response = await axios.post('/api/apiaries', newApiary, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    guestCollection: 'apiaries',
    guestOperation: 'create',
    invalidateKeys: [['apiaries']],
  });
};