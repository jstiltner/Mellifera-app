import 'regenerator-runtime/runtime';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/layout/Dashboard';
import Reports from './components/layout/Reports';
import Login from './components/forms/Login';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import localForageUtil from './localForageUtil';
import './styles/tailwind.css';
import ApiaryDetails from './pages/ApiaryDetails';
import HiveDetails from './pages/HiveDetails';
import InspectionForm from './pages/InspectionForm';
import InspectionReview from './pages/InspectionReview';
import Settings from './pages/Settings';
import TreatmentForm from './pages/TreatmentForm';
import AuthenticatedQueryClientProvider from './hooks/AuthenticatedQueryClientProvider';
import ErrorBoundary from './components/common/ErrorBoundary';

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
      <ErrorProvider>
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
      </ErrorProvider>
    </ErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppWithProviders />
);
