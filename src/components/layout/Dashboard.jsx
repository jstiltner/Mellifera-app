// src/components/layout/Dashboard.jsx
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../context/AuthContext';
import { useGuestMode } from '../../context/GuestModeContext';
import { useGuestModeApiaries } from '../../hooks/useGuestModeQuery';
import { handleApiError, showSuccessToast } from '../../utils/errorHandler';
import { SkeletonDashboard } from '../common/Skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import ErrorBoundary from '../common/ErrorBoundary';
import GuestModeBanner from '../common/GuestModeBanner';
import Menu from './Menu';
import DashboardHeader from './DashboardHeader';
import ApiarySection from './ApiarySection';
import MapSection from './MapSection';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { token } = useAuthContext();
  const { isGuestMode, guestOperations } = useGuestMode();
  const queryClient = useQueryClient();

  const { data: apiaries, isLoading, error, refetch } = useGuestModeApiaries();
  
  const createApiaryMutation = {
    mutateAsync: async (newApiary) => {
      if (isGuestMode) {
        return guestOperations.create('apiaries', newApiary);
      }
      // Authenticated mode - would need API call here
      throw new Error('Authenticated apiary creation not yet implemented in this component');
    }
  };

  useEffect(() => {
    console.log('Dashboard mounted');
    if (token) {
      console.log('Token present, fetching apiaries');
      refetch();
    }

    return () => {
      console.log('Dashboard unmounting');
      queryClient.cancelQueries('apiaries');
    };
  }, [token, refetch, queryClient]);

  const handleApiaryCreate = useCallback(
    async (newApiary) => {
      try {
        console.log('Creating new apiary:', newApiary);
        await createApiaryMutation.mutateAsync(newApiary);
        showSuccessToast('Apiary created successfully!');
        console.log('New apiary created successfully');
        queryClient.invalidateQueries({ queryKey: ['apiaries'] });
      } catch (error) {
        console.error('Failed to create apiary:', error);
        handleApiError(error, 'creating apiary');
      }
    },
    [createApiaryMutation, queryClient]
  );

  if (isLoading) {
    console.log('Loading apiaries data');
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <aside className="w-64 bg-card border-r border-border flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-border">
            <DashboardHeader />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <Menu />
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <SkeletonDashboard />
        </main>
      </div>
    );
  }

  if (error) {
    console.error('Error fetching apiaries:', error);
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <aside className="w-64 bg-card border-r border-border flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-border">
            <DashboardHeader />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <Menu />
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error fetching apiaries: {error.message}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  console.log('Rendering Dashboard component');
  
  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-border">
            <DashboardHeader />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <Menu />
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6 max-w-[1800px] mx-auto">
            <GuestModeBanner />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
              <div className="xl:col-span-2">
                <ApiarySection
                  apiaries={apiaries}
                  onApiaryCreate={handleApiaryCreate}
                  isLoading={isLoading}
                />
              </div>
              <div className="xl:col-span-1">
                <MapSection apiaries={apiaries} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
