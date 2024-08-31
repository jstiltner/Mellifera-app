import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';

const useApiaries = () => {
  const { token } = useAuthContext();

  const fetchApiaries = async () => {
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.get('/api/apiaries', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  };

  return useQuery({
    queryKey: ['apiaries'],
    queryFn: fetchApiaries,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!token, // Only run the query if we have a token
  });
};

const useCreateApiary = () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
    },
  });
};

export { useApiaries, useCreateApiary };
