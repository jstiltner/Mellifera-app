import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const fetchHive = async (hiveId) => {
  try {
    console.log(`Fetching hive with ID: ${hiveId}`);
    const response = await axios.get(`${API_BASE_URL}/hives/${hiveId}`);
    console.log('Hive data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching hive data:', error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data.message : 'Failed to fetch hive data');
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

export const addTreatment = async (hiveId, treatmentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/hives/${hiveId}/treatments`, treatmentData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to add treatment');
  }
};

export const addInspection = async (hiveId, inspectionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/hives/${hiveId}/inspections`, inspectionData);
    return response.data;
  } catch (error) {
    console.error('Error adding inspection:', error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data.message : 'Failed to add inspection');
  }
};

export const fetchInspections = async (hiveId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inspections/${hiveId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching inspections:', error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data.message : 'Failed to fetch inspections');
  }
};

export const addFeeding = async (hiveId, feedingData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/hives/${hiveId}/feedings`, feedingData);
    return response.data;
  } catch (error) {
    console.error('Error adding feeding:', error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data.message : 'Failed to add feeding');
  }
};
