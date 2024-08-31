import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthContext } from './AuthContext';

const ApiaryContext = createContext();

export const useApiaryContext = () => {
  const context = useContext(ApiaryContext);
  if (!context) {
    throw new Error('useApiaryContext must be used within an ApiaryProvider');
  }
  return context;
};

export const ApiaryProvider = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuthContext();
  const queryClient = useQueryClient();

  const {
    data: apiaries,
    isLoading: isApiariesLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['apiaries', user?.id],
    queryFn: async () => {
      if (!user || !user._id) {
        throw new Error('User is not authenticated');
      }
      const response = await axios.get(`/api/apiaries/${user._id}`);
      return response.data;
    },
    enabled: !isAuthLoading && !!user?._id,
  });

  useEffect(() => {
    if (user?._id) {
      refetch();
    }
  }, [user, refetch]);

  const isLoading = isAuthLoading || isApiariesLoading;

  const setApiaries = (newApiaries) => {
    queryClient.setQueryData(['apiaries', user?._id], newApiaries);
  };

  return (
    <ApiaryContext.Provider value={{ apiaries, setApiaries, isLoading, error }}>
      {children}
    </ApiaryContext.Provider>
  );
};
