import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import localForage from 'localforage';

const inspectionsStore = localForage.createInstance({
  name: 'inspections',
});

const fetchInspections = async ({ hiveId }) => {
  try {
    const { data } = await axios.get(`/api/inspections/${hiveId}`);
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

const fetchInspection = async (inspectionId) => {
  try {
    const { data } = await axios.get(`/api/inspections/inspectionReport/${inspectionId}`);
    return data;
  } catch (error) {
    if (!navigator.onLine) {
      const cachedInspections = await inspectionsStore.getItem(`hive_${hiveId}`);
      if (cachedInspections) {
        const cachedInspection = cachedInspections.find(inspection => inspection._id === inspectionId);
        if (cachedInspection) return cachedInspection;
      }
    }
    throw error;
  }
};

const createInspection = async ({ hiveId, inspectionData }) => {
  if (navigator.onLine) {
    const { data } = await axios.post(`/api/inspections/${hiveId}`, inspectionData);
    const cachedInspections = await inspectionsStore.getItem(`hive_${hiveId}`) || [];
    await inspectionsStore.setItem(`hive_${hiveId}`, [...cachedInspections, data]);
    return data;
  } else {
    const tempId = Date.now().toString();
    const newInspection = { ...inspectionData, _id: tempId, isOffline: true, offlineAction: 'create' };
    const cachedInspections = await inspectionsStore.getItem(`hive_${hiveId}`) || [];
    await inspectionsStore.setItem(`hive_${hiveId}`, [...cachedInspections, newInspection]);
    return newInspection;
  }
};

const updateInspection = async ({ hiveId, inspectionId, inspectionData }) => {
  if (navigator.onLine) {
    const { data } = await axios.put(`/api/hives/${hiveId}/inspections/${inspectionId}`, inspectionData);
    const cachedInspections = await inspectionsStore.getItem(`hive_${hiveId}`) || [];
    const updatedCachedInspections = cachedInspections.map(inspection => 
      inspection._id === inspectionId ? data : inspection
    );
    await inspectionsStore.setItem(`hive_${hiveId}`, updatedCachedInspections);
    return data;
  } else {
    const cachedInspections = await inspectionsStore.getItem(`hive_${hiveId}`) || [];
    const updatedCachedInspections = cachedInspections.map(inspection => 
      inspection._id === inspectionId 
        ? { ...inspection, ...inspectionData, isOffline: true, offlineAction: 'update' }
        : inspection
    );
    await inspectionsStore.setItem(`hive_${hiveId}`, updatedCachedInspections);
    return updatedCachedInspections.find(inspection => inspection._id === inspectionId);
  }
};

const deleteInspection = async ({ hiveId, inspectionId }) => {
  if (navigator.onLine) {
    await axios.delete(`/api/hives/${hiveId}/inspections/${inspectionId}`);
    const cachedInspections = await inspectionsStore.getItem(`hive_${hiveId}`) || [];
    const updatedCachedInspections = cachedInspections.filter(inspection => inspection._id !== inspectionId);
    await inspectionsStore.setItem(`hive_${hiveId}`, updatedCachedInspections);
  } else {
    const cachedInspections = await inspectionsStore.getItem(`hive_${hiveId}`) || [];
    const updatedCachedInspections = cachedInspections.map(inspection => 
      inspection._id === inspectionId 
        ? { ...inspection, isOffline: true, offlineAction: 'delete' }
        : inspection
    );
    await inspectionsStore.setItem(`hive_${hiveId}`, updatedCachedInspections);
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

export const useInspection = (inspectionId) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['inspection' , inspectionId],
    queryFn: () => fetchInspection(inspectionId),
    // enabled: !!hiveId && !!inspectionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Failed to fetch inspection:', error);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['inspection', hiveId, inspectionId], data);
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
        { ...inspectionData, _id: 'temp-id' },
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

export const useUpdateInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInspection,
    onMutate: async ({ hiveId, inspectionId, inspectionData }) => {
      await queryClient.cancelQueries({ queryKey: ['inspections', hiveId] });
      const previousInspections = queryClient.getQueryData(['inspections', hiveId]);
      queryClient.setQueryData(['inspections', hiveId], (old) =>
        old.map((inspection) =>
          inspection._id === inspectionId ? { ...inspection, ...inspectionData } : inspection
        )
      );
      return { previousInspections };
    },
    onError: (err, { hiveId }, context) => {
      queryClient.setQueryData(['inspections', hiveId], context.previousInspections);
    },
    onSettled: (data, error, { hiveId, inspectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', hiveId] });
      queryClient.invalidateQueries({ queryKey: ['inspection', hiveId, inspectionId] });
      queryClient.invalidateQueries({ queryKey: ['hives', hiveId] });
    },
  });
};

export const useDeleteInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInspection,
    onMutate: async ({ hiveId, inspectionId }) => {
      await queryClient.cancelQueries({ queryKey: ['inspections', hiveId] });
      const previousInspections = queryClient.getQueryData(['inspections', hiveId]);
      queryClient.setQueryData(['inspections', hiveId], (old) =>
        old.filter((inspection) => inspection._id !== inspectionId)
      );
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
    const offlineModifiedInspections = offlineInspections.filter((inspection) => inspection.isOffline);
    
    for (const inspection of offlineModifiedInspections) {
      try {
        let data;
        if (inspection.offlineAction === 'create') {
          const { data: createdData } = await axios.post(`/api/hives/${hiveId}/inspections`, inspection);
          data = createdData;
        } else if (inspection.offlineAction === 'update') {
          const { data: updatedData } = await axios.put(`/api/hives/${hiveId}/inspections/${inspection._id}`, inspection);
          data = updatedData;
        } else if (inspection.offlineAction === 'delete') {
          await axios.delete(`/api/hives/${hiveId}/inspections/${inspection._id}`);
          data = null;
        }

        const updatedInspections = offlineInspections.map((i) =>
          i._id === inspection._id ? (data ? { ...data, isOffline: false, offlineAction: null } : null) : i
        ).filter(Boolean);
        
        await inspectionsStore.setItem(key, updatedInspections);
      } catch (error) {
        console.error('Failed to sync offline inspection:', error);
      }
    }
  }
});