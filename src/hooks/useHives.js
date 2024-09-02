import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const fetchHives = async (apiaryId) => {
  const { data } = await axios.get(`/api/apiaries/${apiaryId}`);
  return data.children || []; // Return the children array (hives) from the apiary data
};

const fetchHive = async (hiveId) => {
  const { data } = await axios.get(`/api/hives/${hiveId}`);
  return data;
};

const createHive = async ({ apiaryId, hiveData }) => {
  // Use hiveData.children directly, as it already contains the box data
  const requestData = { apiaryId, ...hiveData };
  const { data } = await axios.post('/api/hives', requestData);
  return data;
};

const updateHive = async ({ hiveId, hiveData }) => {
  const { data } = await axios.put(`/api/hives/${hiveId}`, hiveData);
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
    onMutate: async (newHive) => {
      await queryClient.cancelQueries({ queryKey: ['hives', newHive.apiaryId] });
      const previousHives = queryClient.getQueryData(['hives', newHive.apiaryId]);
      queryClient.setQueryData(['hives', newHive.apiaryId], (old) => {
        return old ? [...old, { ...newHive.hiveData, _id: 'temp-id' }] : [{ ...newHive.hiveData, _id: 'temp-id' }];
      });
      return { previousHives };
    },
    onSuccess: (data, { apiaryId }) => {
      queryClient.setQueryData(['hives', apiaryId], (old) => {
        return old ? old.map(hive => hive._id === 'temp-id' ? data : hive) : [data];
      });
      queryClient.invalidateQueries({ queryKey: ['hives', apiaryId] });
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
    },
    onError: (err, newHive, context) => {
      queryClient.setQueryData(['hives', newHive.apiaryId], context.previousHives);
    },
    onSettled: (data, error, { apiaryId }) => {
      queryClient.invalidateQueries({ queryKey: ['hives', apiaryId] });
    },
  });
};

export const useUpdateHive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateHive,
    onMutate: async (updatedHive) => {
      await queryClient.cancelQueries({ queryKey: ['hive', updatedHive.hiveId] });
      const previousHive = queryClient.getQueryData(['hive', updatedHive.hiveId]);
      queryClient.setQueryData(['hive', updatedHive.hiveId], old => ({ ...old, ...updatedHive.hiveData }));
      return { previousHive };
    },
    onSuccess: (data, { hiveId }) => {
      queryClient.setQueryData(['hive', hiveId], data);
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
    },
    onError: (err, updatedHive, context) => {
      queryClient.setQueryData(['hive', updatedHive.hiveId], context.previousHive);
    },
    onSettled: (data, error, { hiveId }) => {
      queryClient.invalidateQueries({ queryKey: ['hive', hiveId] });
    },
  });
};

export const useAddBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBox,
    onSuccess: (newBox, { hiveId }) => {
      queryClient.setQueryData(['hive', hiveId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          children: [...(oldData.children || []), newBox],
        };
      });
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      queryClient.invalidateQueries({ queryKey: ['hive', hiveId] });
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
    },
  });
};