import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ApiaryMap from '../apiary/ApiaryMap';
import ApiaryList from '../../pages/ApiaryList';
import ApiaryForm from '../../pages/ApiaryForm';
import VoiceCommander from '../voice/VoiceCommander';
import { useAuthContext } from '../../context/AuthContext';
import { useApiaries, useCreateApiary } from '../../hooks/useApiaries';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';

const Dashboard = () => {
  const { user, token } = useAuthContext();
  const [showApiaryForm, setShowApiaryForm] = useState(false);
  const [mapError, setMapError] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const { data: apiaries, isLoading, error, refetch } = useApiaries();
  const createApiaryMutation = useCreateApiary();

  useEffect(() => {
    console.log('Dashboard mounted');
    if (token) {
      console.log('Token present, fetching apiaries');
      refetch();
    }

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // You can add additional error handling here, such as showing a global error message
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.log('Dashboard unmounting');
      mountedRef.current = false;
      queryClient.cancelQueries('apiaries');
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [token, refetch, queryClient]);

  useEffect(() => {
    console.log('Apiaries data updated:', apiaries);
  }, [apiaries]);

  const handleApiaryCreate = useCallback(async (newApiary) => {
    try {
      console.log('Creating new apiary:', newApiary);
      await createApiaryMutation.mutateAsync(newApiary);
      if (mountedRef.current) {
        setShowApiaryForm(false);
        console.log('New apiary created successfully');
        queryClient.invalidateQueries({ queryKey: ['apiaries'] });
      }
    } catch (error) {
      console.error('Failed to create apiary:', error);
      // Show an error message to the user
    }
  }, [createApiaryMutation, queryClient]);

  const renderApiaryMap = useCallback(() => {
    try {
      return <ApiaryMap apiaries={apiaries || []} />;
    } catch (error) {
      console.error('Error rendering ApiaryMap:', error);
      setMapError('Failed to load the map. Please try refreshing the page.');
      return null;
    }
  }, [apiaries]);

  if (isLoading) {
    console.log('Loading apiaries data');
    return <LoadingSpinner />;
  }
  
  if (error) {
    console.error('Error fetching apiaries:', error);
    return <ErrorMessage message={`Error fetching apiaries: ${error.message}`} />;
  }

  const isValidApiariesData = Array.isArray(apiaries) && apiaries.length > 0;

  console.log('Rendering Dashboard component');
  return (
    <ErrorBoundary>
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
              {isValidApiariesData ? (
                <ApiaryList apiaries={apiaries} />
              ) : (
                <p>No apiaries data available</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 mt-4">
              {(!isValidApiariesData || showApiaryForm) ? (
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
                {mapError ? (
                  <ErrorMessage message={mapError} />
                ) : (
                  renderApiaryMap()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
