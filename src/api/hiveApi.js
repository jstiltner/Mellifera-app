import axios from 'axios';

const API_BASE_URL = '/api'; // Adjust this if your API has a different base URL

export const fetchHive = async (hiveId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/hives/${hiveId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch hive data');
  }
};

export const updateHive = async (hiveId, hiveData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/hives/${hiveId}`, hiveData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update hive');
  }
};

export const addBox = async (hiveId, boxData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/hives/${hiveId}/boxes`, boxData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to add box');
  }
};

export const updateBox = async (hiveId, boxId, boxData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/hives/${hiveId}/boxes/${boxId}`, boxData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update box');
  }
};

export const deleteBox = async (hiveId, boxId) => {
  try {
    await axios.delete(`${API_BASE_URL}/hives/${hiveId}/boxes/${boxId}`);
  } catch (error) {
    throw new Error('Failed to delete box');
  }
};