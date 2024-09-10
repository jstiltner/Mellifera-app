import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ApiaryMap from './ApiaryMap';
import ApiaryList from './views/ApiaryList';
import ApiaryForm from './views/ApiaryForm';
import VoiceCommander from './VoiceCommander';
import { useAuthContext } from '../context/AuthContext';
import { useApiaries, useCreateApiary } from '../hooks/useApiaries';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

const Dashboard = () => {
  const { user, token } = useAuthContext();
  const [showApiaryForm, setShowApiaryForm] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: apiaries, isLoading, error, refetch } = useApiaries();
  const createApiaryMutation = useCreateApiary();

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token, refetch]);

  useEffect(() => {
    console.log('Apiaries data:', apiaries);
  }, [apiaries]);

  const handleApiaryCreate = async (newApiary) => {
    createApiaryMutation.mutate(newApiary, {
      onSuccess: () => {
        setShowApiaryForm(false);
        console.log('New apiary created:', newApiary);
        queryClient.invalidateQueries({ queryKey: ['apiaries'] });
      },
      onError: (error) => {
        console.error('Failed to create apiary:', error);
        // Show an error message to the user
      },
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    console.error('Error fetching apiaries:', error);
    return <ErrorMessage message={`Error fetching apiaries: ${error.message}`} />;
  }

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
          <div className="flex items-center">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full mr-4 transition duration-300 ease-in-out transform hover:scale-105"
              onClick={() => navigate('/settings')}
            >
              Settings
            </button>
            <VoiceCommander />
          </div>
        </div>
      </header>
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden px-4 pb-4">
        <div className="w-full md:w-1/3 md:pr-4 mb-4 md:mb-0 flex flex-col">
          <div className="bg-white rounded-lg shadow-md p-4 flex-grow overflow-y-auto apiary-list">
            {Array.isArray(apiaries) && apiaries.length > 0 ? (
              <ApiaryList apiaries={apiaries} />
            ) : (
              <p>No apiaries data available</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 mt-4">
            {(!apiaries || apiaries.length === 0 || showApiaryForm) ? (
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
              <ApiaryMap apiaries={apiaries || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
