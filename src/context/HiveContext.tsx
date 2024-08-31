import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthContext } from './AuthContext';

// Types
interface Hive {
  id: string;
  apiaryId: string;
  name: string;
  type: string;
  status: string;
  queenPresent: boolean;
  position: { x: number; y: number };
  boxes: Box[];
  inspections: Inspection[];
}

interface Box {
  type: string;
}

interface Inspection {
  date: string;
}

interface HivePosition {
  x: number;
  y: number;
}

interface HiveContextType {
  fetchHives: (apiaryId: string) => Promise<Hive[]>;
  fetchAllHives: () => Promise<Hive[]>;
  fetchHive: (hiveId: string) => Promise<Hive>;
  createHive: (hiveData: Partial<Hive>) => Promise<Hive>;
  updateHivePosition: (hiveId: string, position: HivePosition) => Promise<Hive>;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
}

const HiveContext = createContext<HiveContextType | undefined>(undefined);

export const useHiveContext = () => {
  const context = useContext(HiveContext);
  if (!context) {
    throw new Error('useHiveContext must be used within a HiveProvider');
  }
  return context;
};

export const HiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Helper function to handle API errors
  const handleApiError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || error.message || 'An error occurred while fetching data';
      console.error('API Error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    setError(errorMessage);
    throw error;
  };

  // Clear error
  const clearError = () => setError(null);

  // Fetch hives for a specific apiary
  const fetchHives = async (apiaryId: string): Promise<Hive[]> => {
    if (!isAuthenticated) return [];
    try {
      const response = await axios.get<Hive[]>(`/api/hives?apiaryId=${apiaryId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

  // Fetch all hives
  const fetchAllHives = async (): Promise<Hive[]> => {
    if (!isAuthenticated) return [];
    try {
      const response = await axios.get<Hive[]>('/api/hives');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

  // Fetch a single hive by ID
  const fetchHive = async (hiveId: string): Promise<Hive> => {
    if (!isAuthenticated) throw new Error('User is not authenticated');
    try {
      const response = await axios.get<Hive>(`/api/hives/${hiveId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

  // Create a new hive
  const createHive = async (hiveData: Partial<Hive>): Promise<Hive> => {
    try {
      const response = await axios.post<Hive>('/api/hives', hiveData);
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

  // Update hive position
  const updateHivePosition = async (hiveId: string, position: HivePosition): Promise<Hive> => {
    try {
      const response = await axios.put<Hive>(`/api/hives/${hiveId}/position`, position);
      queryClient.invalidateQueries({ queryKey: ['hives', hiveId] });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

  const value: HiveContextType = {
    fetchHives,
    fetchAllHives,
    fetchHive,
    createHive,
    updateHivePosition,
    isAuthenticated,
    error,
    clearError,
  };

  return <HiveContext.Provider value={value}>{children}</HiveContext.Provider>;
};
