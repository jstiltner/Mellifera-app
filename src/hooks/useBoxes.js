import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';
import { useGuestMode } from '../context/GuestModeContext';

export const useCreateBox = () => {
  const { token } = useAuthContext();
  const { isGuestMode, guestOperations } = useGuestMode();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boxData) => {
      if (isGuestMode) {
        return guestOperations.create('boxes', boxData);
      }
      const response = await axios.post('/api/boxes', boxData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['boxes']);
    },
    onError: (error) => {
      console.error('Error creating box:', error);
    },
  });
};

export const useUpdateBox = () => {
  const { token } = useAuthContext();
  const { isGuestMode, guestOperations } = useGuestMode();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, boxData }) => {
      console.log('Updating box:', id, boxData);
      if (isGuestMode) {
        guestOperations.update('boxes', id, boxData);
        return guestOperations.getById('boxes', id);
      }
      const response = await axios.put(`/api/boxes/${id}`, boxData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Box updated successfully:', data);
      queryClient.invalidateQueries(['boxes']);
    },
    onError: (error) => {
      console.error('Error updating box:', error);
    },
  });
};

export const useDeleteBox = () => {
  const { token } = useAuthContext();
  const { isGuestMode, guestOperations } = useGuestMode();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (isGuestMode) {
        guestOperations.delete('boxes', id);
        return { success: true };
      }
      const response = await axios.delete(`/api/boxes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['boxes']);
    },
    onError: (error) => {
      console.error('Error deleting box:', error);
    },
  });
};
