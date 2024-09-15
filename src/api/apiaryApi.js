import axios from 'axios';

const API_BASE_URL = '/api'; // Adjust this to match your API base URL

export const fetchApiary = async (apiaryId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/apiaries/${apiaryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching apiary:', error);
    throw error;
  }
};

export const fetchHives = async ({ apiaryId }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/hives`, {
      params: {
        apiaryId,
        populate: 'children', // Request populated children data
      },
    });
    return response.data.hives; // Return the hives array directly
  } catch (error) {
    console.error('Error fetching hives:', error);
    throw error;
  }
};

export const createHive = async ({ apiaryId, hiveData }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/hives`, {
      ...hiveData,
      apiaryId,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating hive:', error);
    throw error;
  }
};

export const updateHive = async (hiveId, hiveData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/hives/${hiveId}`, hiveData);
    return response.data;
  } catch (error) {
    console.error('Error updating hive:', error);
    throw error;
  }
};

export const deleteHive = async (hiveId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/hives/${hiveId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting hive:', error);
    throw error;
  }
};
