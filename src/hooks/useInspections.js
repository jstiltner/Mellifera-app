import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const fetchInspections = async (hiveId) => {
  const { data } = await axios.get(`/api/hives/${hiveId}/inspections`);
  return data;
};

const createInspection = async ({ hiveId, inspectionData }) => {
  const { data } = await axios.post(`/api/hives/${hiveId}/inspections`, inspectionData);
  return data;
};

export const useInspections = (hiveId) => {
  return useQuery({
    queryKey: ['inspections', hiveId],
    queryFn: () => fetchInspections(hiveId),
    enabled: !!hiveId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInspection,
    onSuccess: (data, { hiveId }) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', hiveId] });
      queryClient.invalidateQueries({ queryKey: ['hives', hiveId] });
    },
  });
};