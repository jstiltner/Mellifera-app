import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import localForage from 'localforage';

const inspectionsStore = localForage.createInstance({
  name: 'inspections',
});

const fetchInspections = async (hiveId) => {
  try {
    const { data } = await axios.get(`/api/hives/${hiveId}/inspections`);
    await inspectionsStore.setItem(`hive_${hiveId}`, data);
    return data;
  } catch (error) {
    if (!navigator.onLine) {
      const cachedData = await inspectionsStore.getItem(`hive_${hiveId}`);
      if (cachedData) return cachedData;
    }
    throw error;
  }
};

const createInspection = async ({ hiveId, inspectionData }) => {
  if (navigator.onLine) {
    const { data } = await axios.post(`/api/hives/${hiveId}/inspections`, inspectionData);
    const cachedInspections = await inspectionsStore.getItem(`hive_${hiveId}`) || [];
    await inspectionsStore.setItem(`hive_${hiveId}`, [...cachedInspections, data]);
    return data;
  } else {
    const tempId = Date.now().toString();
    const newInspection = { ...inspectionData, id: tempId, isOffline: true };
    const cachedInspections = await inspectionsStore.getItem(`hive_${hiveId}`) || [];
    await inspectionsStore.setItem(`hive_${hiveId}`, [...cachedInspections, newInspection]);
    return newInspection;
  }
};

export const useInspections = (hiveId) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['inspections', hiveId],
    queryFn: () => fetchInspections(hiveId),
    enabled: !!hiveId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Failed to fetch inspections:', error);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['inspections', hiveId], data);
    },
  });
};

export const useCreateInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInspection,
    onMutate: async ({ hiveId, inspectionData }) => {
      await queryClient.cancelQueries({ queryKey: ['inspections', hiveId] });
      const previousInspections = queryClient.getQueryData(['inspections', hiveId]);
      queryClient.setQueryData(['inspections', hiveId], (old) => [
        ...(old || []),
        { ...inspectionData, id: 'temp-id' },
      ]);
      return { previousInspections };
    },
    onError: (err, { hiveId }, context) => {
      queryClient.setQueryData(['inspections', hiveId], context.previousInspections);
    },
    onSettled: (data, error, { hiveId }) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', hiveId] });
      queryClient.invalidateQueries({ queryKey: ['hives', hiveId] });
    },
  });
};

// Sync offline data when coming back online
window.addEventListener('online', async () => {
  const keys = await inspectionsStore.keys();
  for (const key of keys) {
    const hiveId = key.split('_')[1];
    const offlineInspections = await inspectionsStore.getItem(key);
    const offlineCreatedInspections = offlineInspections.filter((inspection) => inspection.isOffline);
    
    for (const inspection of offlineCreatedInspections) {
      try {
        const { data } = await axios.post(`/api/hives/${hiveId}/inspections`, inspection);
        const updatedInspections = offlineInspections.map((i) =>
          i.id === inspection.id ? { ...data, isOffline: false } : i
        );
        await inspectionsStore.setItem(key, updatedInspections);
      } catch (error) {
        console.error('Failed to sync offline inspection:', error);
      }
    }
  }
});