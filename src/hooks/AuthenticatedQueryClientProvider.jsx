import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthContext } from '../context/AuthContext';
import { globalQueryErrorHandler, globalMutationErrorHandler } from '../utils/errorHandling';

const AuthenticatedQueryClientProvider = ({ children }) => {
  const { token } = useAuthContext();

  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        onError: globalQueryErrorHandler,
      },
      mutations: {
        retry: 1,
        onError: globalMutationErrorHandler,
      },
    },
  }), []);

  useMemo(() => {
    if (token) {
      queryClient.setDefaultOptions({
        queries: {
          queryFn: async ({ queryKey }) => {
            const [url, params] = queryKey;
            const response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              ...params,
            });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          },
        },
      });
    }
  }, [token, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default AuthenticatedQueryClientProvider;