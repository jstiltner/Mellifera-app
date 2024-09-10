import 'regenerator-runtime/runtime';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import localForageUtil from './localForageUtil';
import './styles/tailwind.css';
import ApiaryDetails from './components/views/ApiaryDetails';
import HiveDetails from './components/views/HiveDetails';
import InspectionForm from './components/views/InspectionForm';
import InspectionReview from './components/views/InspectionReview';
import Settings from './components/views/Settings';
import TreatmentForm from './components/views/TreatmentForm';
import AuthenticatedQueryClientProvider from './hooks/AuthenticatedQueryClientProvider';
import ErrorBoundary from './components/ErrorBoundary';

// Register service worker
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

const AppWithProviders = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const syncData = async () => {
      if (isOnline) {
        // Sync data with server when online
        const offlineData = await localForageUtil.getItem('offlineData');
        if (offlineData) {
          // Send offlineData to server
          // After successful sync, clear offline data
          await localForageUtil.removeItem('offlineData');
        }
      }
    };

    syncData();
  }, [isOnline]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthenticatedQueryClientProvider>
          <Router>
            <div className="min-h-screen bg-hive-light">
              {!isOnline && (
                <div className="bg-yellow-500 text-white p-2 text-center">
                  You are currently offline. Some features may be limited.
                </div>
              )}
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Dashboard isOnline={isOnline} />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Reports isOnline={isOnline} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/apiary/:id"
                  element={
                    <ProtectedRoute>
                      <ApiaryDetails isOnline={isOnline}/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hives/:id"
                  element={
                    <ProtectedRoute>
                      <HiveDetails isOnline={isOnline}/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hives/:id/edit"
                  element={
                    <ProtectedRoute>
                      <HiveDetails isOnline={isOnline} isEditing={true}/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hives/:id/add-treatment"
                  element={
                    <ProtectedRoute>
                      <TreatmentForm isOnline={isOnline}/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hives/:hiveId/add-inspection"
                  element={
                    <ProtectedRoute>
                      <InspectionForm isOnline={isOnline}/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inspections/:inspectionId"
                  element={
                    <ProtectedRoute>
                      <InspectionReview isOnline={isOnline}/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings isOnline={isOnline}/>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AuthenticatedQueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppWithProviders />
);
