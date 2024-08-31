import React, { useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../context/AuthContext';

const useQueryClientWithAuth = () => {
  const { token } = useAuthContext();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
      },
      mutations: {
        retry: 1,
      },
    },
  });

  useEffect(() => {
    if (token) {
      queryClient.setDefaultOptions({
        queries: {
          queryFn: async ({ queryKey }) => {
            try {
              const response = await fetch(queryKey[0], {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            } catch (error) {
              console.error('Query error:', error);
              throw error;
            }
          },
        },
        mutations: {
          mutationFn: async (variables) => {
            try {
              const { url, method, data } = variables;
              const response = await fetch(url, {
                method: method || 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            } catch (error) {
              console.error('Mutation error:', error);
              throw error;
            }
          },
        },
      });
    }
  }, [token]);

  return queryClient;
};

export default useQueryClientWithAuth;
