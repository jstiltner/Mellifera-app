import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useGuestMode } from '../context/GuestModeContext';

const API_BASE_URL = '/api/treatments';

export const useTreatments = () => {
  const queryClient = useQueryClient();
  const { isGuestMode, guestOperations } = useGuestMode();

  const getTreatmentsByHive = (hiveId) => {
    return useQuery({
      queryKey: ['treatments', hiveId],
      queryFn: async () => {
        if (isGuestMode) {
          return guestOperations.query('treatments', (treatment) => treatment.hive === hiveId);
        }
        const { data } = await axios.get(`${API_BASE_URL}/${hiveId}`);
        return data;
      },
    });
  };

  const createTreatment = useMutation({
    mutationFn: async (treatmentData) => {
      if (isGuestMode) {
        if (Array.isArray(treatmentData)) {
          return treatmentData.map(t => guestOperations.create('treatments', t));
        }
        return guestOperations.create('treatments', treatmentData);
      }
      const { data } = await axios.post(API_BASE_URL, treatmentData);
      return data;
    },
    onSuccess: (data, variables) => {
      if (Array.isArray(data)) {
        // Batch treatment
        data.forEach((treatment) => {
          queryClient.invalidateQueries(['treatments', treatment.hive]);
        });
      } else {
        // Single treatment
        queryClient.invalidateQueries(['treatments', data.hive]);
      }
    },
  });

  const updateTreatment = useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      if (isGuestMode) {
        guestOperations.update('treatments', id, updateData);
        return guestOperations.getById('treatments', id);
      }
      const { data } = await axios.put(`${API_BASE_URL}/${id}`, updateData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['treatments', data.hive]);
    },
  });

  const deleteTreatment = useMutation({
    mutationFn: async (id) => {
      if (isGuestMode) {
        guestOperations.delete('treatments', id);
        return id;
      }
      await axios.delete(`${API_BASE_URL}/${id}`);
      return id;
    },
    onSuccess: (_, variables) => {
      // We don't know the hiveId here, so we'll need to invalidate all treatments queries
      queryClient.invalidateQueries(['treatments']);
    },
  });

  return {
    getTreatmentsByHive,
    createTreatment,
    updateTreatment,
    deleteTreatment,
  };
};
