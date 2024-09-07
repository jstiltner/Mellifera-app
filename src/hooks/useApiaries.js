import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';

const fetchApiaries = async (token) => {
  if (!token) {
    throw new Error('No authentication token available');
  }
  try {
    const response = await axios.get('/api/apiaries', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Server error: ${error.response.data.message || error.message}`);
      } else if (error.request) {
        throw new Error('No response received from server. Please check your internet connection.');
      }
    }
    throw new Error('An unexpected error occurred');
  }
};

export const fetchApiary = async (apiaryId, token) => {
  if (!token) {
    throw new Error('No authentication token available');
  }
  const response = await axios.get(`/api/apiaries/${apiaryId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const fetchHives = async (apiaryId, page, token) => {
  console.log('fetchHives called with:', { apiaryId, page, token: token ? 'present' : 'missing' });
  if (!token) {
    throw new Error('No authentication token available');
  }
  try {
    const url = `/api/apiaries/${apiaryId}/hives`;
    console.log('Fetching hives from:', url, 'with params:', { page });
    const response = await axios.get(url, {
      params: { page },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Hives fetch successful. Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching hives:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(`Server error: ${error.response.data.message || error.message}`);
      } else if (error.request) {
        throw new Error('No response received from server. Please check your internet connection.');
      }
    }
    throw new Error('An unexpected error occurred while fetching hives');
  }
};

export const createHive = async (apiaryId, hiveData, token) => {
  if (!token) {
    throw new Error('No authentication token available');
  }
  const response = await axios.post(`/api/apiaries/${apiaryId}/hives`, hiveData, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const useApiaries = () => {
  const { token } = useAuthContext();

  return useQuery({
    queryKey: ['apiaries'],
    queryFn: () => fetchApiaries(token),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!token,
    retry: (failureCount, error) => {
      return failureCount < 3 && error.message !== 'Authentication failed. Please log in again.';
    },
  });
};

export const useApiary = (apiaryId) => {
  const { token } = useAuthContext();

  return useQuery({
    queryKey: ['apiary', apiaryId],
    queryFn: () => fetchApiary(apiaryId, token),
    enabled: !!apiaryId && !!token,
  });
};

export const useHives = (apiaryId) => {
  const { token } = useAuthContext();

  return useInfiniteQuery({
    queryKey: ['hives', apiaryId],
    queryFn: ({ pageParam = 1 }) => fetchHives(apiaryId, pageParam, token),
    getNextPageParam: (lastPage, pages) => lastPage.nextPage,
    enabled: !!apiaryId && !!token,
  });
};

export const useCreateApiary = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthContext();

  const createApiary = async (newApiary) => {
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.post('/api/apiaries', newApiary, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  };

  return useMutation({
    mutationFn: createApiary,
    onSuccess: (data) => {
      queryClient.setQueryData(['apiaries'], (old) => [...(old || []), data]);
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
    },
    onError: (error) => {
      console.error('Failed to create apiary:', error);
      // You can add more error handling here, such as showing a notification to the user
    },
  });
};

export const useCreateHive = (apiaryId) => {
  const queryClient = useQueryClient();
  const { token } = useAuthContext();

  return useMutation({
    mutationFn: (hiveData) => createHive(apiaryId, hiveData, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['hives', apiaryId]);
    },
    onError: (error) => {
      console.error('Error creating hive:', error);
    },
  });
};
