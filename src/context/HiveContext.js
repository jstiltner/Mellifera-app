import React, { createContext, useContext } from 'react';
import { QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useQueryClientWithAuth from '../hooks/useQueryClientWithAuth';
import { useAuthContext } from './AuthContext';
import axios from 'axios';

const HiveContext = createContext();

export const useHiveContext = () => {
  const context = useContext(HiveContext);
  if (!context) {
    throw new Error('useHiveContext must be used within a HiveProvider');
  }
  return context;
};

export const HiveProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuthContext();
  const queryClient = useQueryClientWithAuth();

  const authAxios = axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchHives = async (apiaryId) => {
    if (!isAuthenticated) return [];
    const response = await authAxios.get(`/api/hives?apiaryId=${apiaryId}`);
    return response.data;
  };

  const fetchHive = async (hiveId) => {
    if (!isAuthenticated) throw new Error('User is not authenticated');
    const response = await authAxios.get(`/api/hives/${hiveId}`);
    return response.data;
  };

  const fetchAllHives = async () => {
    if (!isAuthenticated) return [];
    const response = await authAxios.get('/api/hives');
    return response.data;
  };

  const createHive = async (hiveData) => {
    const response = await authAxios.post('/api/hives', hiveData);
    return response.data;
  };

  const updateHivePosition = async ({ hiveId, position }) => {
    const response = await authAxios.put(`/api/hives/${hiveId}/position`, position);
    return response.data;
  };

  const useHives = (apiaryId) => useQuery(['hives', apiaryId], () => fetchHives(apiaryId), {
    enabled: isAuthenticated && !!apiaryId,
  });

  const useHive = (hiveId) => useQuery(['hive', hiveId], () => fetchHive(hiveId), {
    enabled: isAuthenticated && !!hiveId,
  });

  const useAllHives = () => useQuery('allHives', fetchAllHives, {
    enabled: isAuthenticated,
  });

  const useCreateHive = () => useMutation(createHive, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('allHives');
      queryClient.invalidateQueries(['hives', data.parent]);
    },
  });

  const useUpdateHivePosition = () => useMutation(updateHivePosition);

  const addHive = (newHive) => {
    queryClient.setQueryData('allHives', (oldData) => {
      return oldData ? [...oldData, newHive] : [newHive];
    });
    queryClient.setQueryData(['hives', newHive.parent], (oldData) => {
      return oldData ? [...oldData, newHive] : [newHive];
    });
  };

  const value = {
    useHives,
    useHive,
    useAllHives,
    useCreateHive,
    useUpdateHivePosition,
    addHive,
    isAuthenticated,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <HiveContext.Provider value={value}>{children}</HiveContext.Provider>
    </QueryClientProvider>
  );
};
