import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchHives = async ({ apiaryId, pageParam = 1 }) => {
  try {
    const { data } = await axios.get(`/api/hives`, {
      params: { apiaryId, page: pageParam, limit: 10 }
    });
    return data;
  } catch (error) {
    throw new Error('Failed to fetch hives: ' + error.message);
  }
};

const fetchHive = async ({ hiveId }) => {
  if (!hiveId) {
    throw new Error('Hive ID is required');
  }
  try {
    const { data } = await axios.get(`/api/hives/${hiveId}`);
    return data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Hive not found');
    }
    throw new Error('Failed to fetch hive: ' + error.message);
  }
};

const createHive = async ({ apiaryId, hiveData }) => {
  try {
    const requestData = { apiaryId, ...hiveData };
    const { data } = await axios.post('/api/hives/', requestData);
    return data;
  } catch (error) {
    throw new Error('Failed to create hive: ' + error.message);
  }
};

const updateHive = async ({ hiveId, hiveData }) => {
  try {
    const { data } = await axios.put(`/api/hives/${hiveId}`, hiveData);
    return data;
  } catch (error) {
    throw new Error('Failed to update hive: ' + error.message);
  }
};

const addBox = async ({ hiveId, boxData }) => {
  try {
    const { data } = await axios.post(`/api/box-addition/${hiveId}`, { hiveId, ...boxData });
    return data;
  } catch (error) {
    throw new Error('Failed to add box: ' + error.message);
  }
};

const updateBox = async ({ hiveId, boxId, boxData }) => {
  try {
    const { data } = await axios.put(`/api/hives/${hiveId}/boxes/${boxId}`, boxData);
    return data;
  } catch (error) {
    throw new Error('Failed to update box: ' + error.message);
  }
};

const deleteBox = async ({ hiveId, boxId }) => {
  try {
    const { data } = await axios.delete(`/api/hives/${hiveId}/boxes/${boxId}`);
    return data;
  } catch (error) {
    throw new Error('Failed to delete box: ' + error.message);
  }
};

// Hook to fetch all hives for an apiary
export const useHives = ({ apiaryId }) => {
  return useInfiniteQuery({
    queryKey: ['hives', apiaryId],
    queryFn: ({ pageParam = 1 }) => fetchHives({ apiaryId, pageParam }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
    },
    enabled: !!apiaryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      hives: data.pages.flatMap(page => page.hives)
    }),
  });
};

// Hook to fetch a single hive
export const useHive = ({ hiveId }) => {
  return useQuery({
    queryKey: ['hive', hiveId],
    queryFn: () => fetchHive({ hiveId }),
    enabled: !!hiveId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3, // Retry 3 times on failure
    select: (data) => ({
      ...data,
      boxCount: data.children?.length || 0
    }),
    onError: (error) => {
      console.error('Error fetching hive:', error);
      // You can add additional error handling here, such as showing a toast notification
    }
  });
};

// Hook to create a new hive
export const useCreateHive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHive,
    onMutate: async (newHive) => {
      await queryClient.cancelQueries({ queryKey: ['hives', newHive.apiaryId] });
      const previousHives = queryClient.getQueryData(['hives', newHive.apiaryId]);
      queryClient.setQueryData(['hives', newHive.apiaryId], (old) => {
        const newHiveData = { ...newHive.hiveData, _id: 'temp-id' };
        return old
          ? {
              ...old,
              pages: old.pages.map((page, index) =>
                index === 0 ? { ...page, hives: [newHiveData, ...page.hives] } : page
              ),
              hives: [newHiveData, ...(old.hives || [])]
            }
          : { pages: [{ hives: [newHiveData] }], hives: [newHiveData] };
      });
      return { previousHives };
    },
    onSuccess: (data, { apiaryId }) => {
      queryClient.setQueryData(['hives', apiaryId], (old) => {
        return old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                hives: page.hives.map((hive) => (hive._id === 'temp-id' ? data : hive)),
              })),
              hives: old.hives.map((hive) => (hive._id === 'temp-id' ? data : hive))
            }
          : { pages: [{ hives: [data] }], hives: [data] };
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

// Hook to update an existing hive
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

// Hook to add a new box to a hive
export const useAddBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBox,
    onMutate: async ({ hiveId, boxData }) => {
      await queryClient.cancelQueries({ queryKey: ['hive', hiveId] });
      const previousHive = queryClient.getQueryData(['hive', hiveId]);
      const newBox = { ...boxData, _id: 'temp-id' };
      queryClient.setQueryData(['hive', hiveId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          children: [...(oldData.children || []), newBox],
          boxCount: (oldData.boxCount || 0) + 1
        };
      });
      return { previousHive };
    },
    onSuccess: (newBox, { hiveId }) => {
      queryClient.setQueryData(['hive', hiveId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          children: oldData.children.map(box => box._id === 'temp-id' ? newBox : box),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      queryClient.invalidateQueries({ queryKey: ['hive', hiveId] });
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
    },
    onError: (error, { hiveId }, context) => {
      queryClient.setQueryData(['hive', hiveId], context.previousHive);
    },
    onSettled: (data, error, { hiveId }) => {
      queryClient.invalidateQueries({ queryKey: ['hive', hiveId] });
    },
  });
};

// Hook to update an existing box in a hive
export const useUpdateBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBox,
    onMutate: async ({ hiveId, boxId, boxData }) => {
      await queryClient.cancelQueries({ queryKey: ['hive', hiveId] });
      const previousHive = queryClient.getQueryData(['hive', hiveId]);
      queryClient.setQueryData(['hive', hiveId], (oldHive) => {
        if (!oldHive) return oldHive;
        const updatedChildren = oldHive.children.map((box) =>
          box._id === boxId ? { ...box, ...boxData } : box
        );
        return { ...oldHive, children: updatedChildren };
      });
      return { previousHive };
    },
    onSuccess: (data, { hiveId }) => {
      queryClient.invalidateQueries({ queryKey: ['hive', hiveId] });
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
    },
    onError: (err, { hiveId }, context) => {
      queryClient.setQueryData(['hive', hiveId], context.previousHive);
    },
    onSettled: (data, error, { hiveId }) => {
      queryClient.invalidateQueries({ queryKey: ['hive', hiveId] });
    },
  });
};

// Hook to delete a box from a hive
export const useDeleteBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBox,
    onMutate: async ({ hiveId, boxId }) => {
      await queryClient.cancelQueries({ queryKey: ['hive', hiveId] });
      const previousHive = queryClient.getQueryData(['hive', hiveId]);
      queryClient.setQueryData(['hive', hiveId], (oldHive) => {
        if (!oldHive) return oldHive;
        const updatedChildren = oldHive.children.filter((box) => box._id !== boxId);
        return { 
          ...oldHive, 
          children: updatedChildren,
          boxCount: oldHive.boxCount - 1
        };
      });
      return { previousHive };
    },
    onSuccess: (data, { hiveId }) => {
      queryClient.invalidateQueries({ queryKey: ['hive', hiveId] });
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
    },
    onError: (err, { hiveId }, context) => {
      queryClient.setQueryData(['hive', hiveId], context.previousHive);
    },
    onSettled: (data, error, { hiveId }) => {
      queryClient.invalidateQueries({ queryKey: ['hive', hiveId] });
    },
  });
};