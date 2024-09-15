import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = '/api/treatments';

export const useTreatments = () => {
  const queryClient = useQueryClient();

  const getTreatmentsByHive = (hiveId) => {
    return useQuery({
      queryKey: ['treatments', hiveId],
      queryFn: async () => {
        const { data } = await axios.get(`${API_BASE_URL}/${hiveId}`);
        return data;
      },
    });
  };

  const createTreatment = useMutation({
    mutationFn: async (treatmentData) => {
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
      const { data } = await axios.put(`${API_BASE_URL}/${id}`, updateData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['treatments', data.hive]);
    },
  });

  const deleteTreatment = useMutation({
    mutationFn: async (id) => {
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
