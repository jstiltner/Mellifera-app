import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const fetchHives = async (apiaryId) => {
  const { data } = await axios.get(`/api/apiaries/${apiaryId}/hives`);
  return data;
};

const fetchHive = async (hiveId) => {
  const { data } = await axios.get(`/api/hives/${hiveId}`);
  return data;
};

const createHive = async ({ apiaryId, hiveData }) => {
  const { data } = await axios.post(`/api/apiaries/${apiaryId}/hives`, hiveData);
  return data;
};

const addBox = async ({ hiveId, boxData }) => {
  const { data } = await axios.post(`/api/hives/${hiveId}/boxes`, boxData);
  return data;
};

export const useHives = (apiaryId) => {
  return useQuery({
    queryKey: ['hives', apiaryId],
    queryFn: () => fetchHives(apiaryId),
    enabled: !!apiaryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useHive = (hiveId) => {
  return useQuery({
    queryKey: ['hive', hiveId],
    queryFn: () => fetchHive(hiveId),
    enabled: !!hiveId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateHive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHive,
    onSuccess: (data, { apiaryId }) => {
      queryClient.invalidateQueries({ queryKey: ['hives', apiaryId] });
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
      queryClient.invalidateQueries({ queryKey: ['hive'] });
    },
  });
};

export const useAddBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBox,
    onSuccess: (newBox, { hiveId }) => {
      // Update the cache for the specific hive
      queryClient.setQueryData(['hive', hiveId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          children: [...(oldData.children || []), newBox],
        };
      });

      // Invalidate queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      queryClient.invalidateQueries({ queryKey: ['hive', hiveId] });
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
    },
  });
};