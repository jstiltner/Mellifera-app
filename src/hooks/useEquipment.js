import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import localForage from 'localforage';

const API_URL = '/api/equipment';

export const useEquipment = () => {
  const queryClient = useQueryClient();

  const fetchEquipment = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    await localForage.setItem('equipment', data);
    return data;
  };

  const addEquipment = async (newEquipment) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEquipment),
    });
    if (!response.ok) {
      throw new Error('Failed to add equipment');
    }
    return response.json();
  };

  const updateEquipment = async (updatedEquipment) => {
    const response = await fetch(`${API_URL}/${updatedEquipment._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEquipment),
    });
    if (!response.ok) {
      throw new Error('Failed to update equipment');
    }
    return response.json();
  };

  const deleteEquipment = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete equipment');
    }
    return response.json();
  };

  const {
    data: equipment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['equipment'],
    queryFn: fetchEquipment,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  const addEquipmentMutation = useMutation({
    mutationFn: addEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries(['equipment']);
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: updateEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries(['equipment']);
    },
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: deleteEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries(['equipment']);
    },
  });

  return {
    equipment,
    isLoading,
    error,
    addEquipment: addEquipmentMutation.mutate,
    updateEquipment: updateEquipmentMutation.mutate,
    deleteEquipment: deleteEquipmentMutation.mutate,
  };
};
