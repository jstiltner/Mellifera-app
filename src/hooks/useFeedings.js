import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { errorToast, successToast } from '../utils/errorHandling';

const API_URL = '/api/feedings';

export const useFeedings = () => {
  const queryClient = useQueryClient();

  const getFeedings = async (hiveId) => {
    try {
      const response = await axios.get(`${API_URL}/hive/${hiveId}`);
      return response.data;
    } catch (error) {
      errorToast(error, 'Error fetching feedings');
      throw error;
    }
  };

  const addFeeding = async (feedingData) => {
    try {
      const response = await axios.post(API_URL, feedingData);
      successToast('Feeding added successfully');
      return response.data;
    } catch (error) {
      errorToast(error, 'Error adding feeding');
      throw error;
    }
  };

  const updateFeeding = async ({ id, ...feedingData }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, feedingData);
      successToast('Feeding updated successfully');
      return response.data;
    } catch (error) {
      errorToast(error, 'Error updating feeding');
      throw error;
    }
  };

  const deleteFeeding = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      successToast('Feeding deleted successfully');
    } catch (error) {
      errorToast(error, 'Error deleting feeding');
      throw error;
    }
  };

  const addFeedingMutation = useMutation({
    mutationFn: addFeeding,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['feedings', variables.hiveId]);
    },
  });

  const updateFeedingMutation = useMutation({
    mutationFn: updateFeeding,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['feedings', variables.hiveId]);
    },
  });

  const deleteFeedingMutation = useMutation({
    mutationFn: deleteFeeding,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['feedings', variables.hiveId]);
    },
  });

  return {
    getFeedings,
    addFeeding: addFeedingMutation.mutate,
    updateFeeding: updateFeedingMutation.mutate,
    deleteFeeding: deleteFeedingMutation.mutate,
  };
};
