import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ApiaryMap from './ApiaryMap';
import ApiaryList from './views/ApiaryList';
import ApiaryForm from './views/ApiaryForm';
import VoiceCommander from './VoiceCommander';
import { useAuthContext } from '../context/AuthContext';
import { useApiaries } from '../hooks/useApiaries';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuthContext();
  const [showApiaryForm, setShowApiaryForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: apiaries, isLoading: isApiariesLoading, error: apiariesError } = useApiaries();

  useEffect(() => {
    if (isApiariesLoading) {
      console.log('Loading apiaries...');
    } else if (apiariesError) {
      console.error('Error loading apiaries:', apiariesError);
    } else {
      console.log('Apiaries loaded successfully:', apiaries);
    }

    return () => {
      console.log('Clean up on component unmount or before next effect run');
    };
  }, [apiaries, isApiariesLoading, apiariesError]);

  const handleApiaryCreate = async (newApiary) => {
    const previousApiaries = queryClient.getQueryData(['apiaries', user._id]);

    queryClient.setQueryData(['apiaries', user._id], (oldData) => [...(oldData || []), newApiary]);

    try {
      await axios.post('/api/apiaries', newApiary);
      setShowApiaryForm(false);
      console.log('New apiary created:', newApiary);
    } catch (error) {
      console.error('Failed to create apiary:', error);
      queryClient.setQueryData(['apiaries', user._id], previousApiaries);
      // Show an error message to the user
    }
  };

  // Render logic based on loading or error states
  if (isApiariesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (apiariesError) {
    return (
      <div className="text-red-600 p-4">
        <h2 className="text-xl font-bold">An error occurred:</h2>
        <p>{apiariesError.message}</p>
        <p>Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  // Main component rendering
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
            <h2 className="text-lg md:text-xl text-gray-600">
              Welcome, {user?.name || 'Beekeeper'}!
            </h2>
          </div>
          <VoiceCommander />
        </div>
      </header>
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden px-4 pb-4">
        <div className="w-full md:w-1/3 md:pr-4 mb-4 md:mb-0 flex flex-col">
          <div className="bg-white rounded-lg shadow-md p-4 flex-grow overflow-y-auto apiary-list">
            <ApiaryList apiaries={apiaries} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 mt-4">
            {(apiaries && apiaries.length === 0) || showApiaryForm ? (
              <ApiaryForm onApiaryCreate={handleApiaryCreate} />
            ) : (
              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                onClick={() => setShowApiaryForm(true)}
              >
                Add New Apiary
              </button>
            )}
          </div>
        </div>
        <div className="w-full md:w-2/3 h-96 md:h-auto">
          <div className="bg-white rounded-lg shadow-md p-4 h-full apiary-map">
            <div className="h-full relative">
              <ApiaryMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
