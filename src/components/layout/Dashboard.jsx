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
import Menu from './Menu';

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

  const handleApiaryCreate = useCallback(
    async (newApiary) => {
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
      }
    },
    [createApiaryMutation, queryClient]
  );

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
        <header className="bg-white shadow-md p-4 h-16">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex items-center">
              <span className="mr-4 text-lg text-gray-600">
                Welcome, {user?.name || 'Beekeeper'}!
              </span>
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 bg-white shadow-md p-4 overflow-y-auto">
            <Menu />
          </aside>
          <main className="flex-1 overflow-hidden p-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
              <div className="lg:col-span-2 flex flex-col overflow-hidden">
                <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex-grow overflow-y-auto">
                  {isValidApiariesData ? (
                    <ApiaryList apiaries={apiaries} />
                  ) : (
                    <p>No apiaries data available</p>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  {!isValidApiariesData || showApiaryForm ? (
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
              <div className="lg:col-span-3 flex flex-col min-h-[400px]">
                <div className="bg-white rounded-lg shadow-md p-4 flex-grow">
                  <div className="h-full w-full">
                    {mapError ? <ErrorMessage message={mapError} /> : renderApiaryMap()}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
