import 'regenerator-runtime/runtime';
import { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Dashboard from './components/layout/Dashboard';
import Reports from './components/layout/Reports';
import Login from './components/forms/Login';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import { SpeechRecognitionProvider } from './context/SpeechRecognitionContext';
import localForageUtil from './localForageUtil';
import 'leaflet/dist/leaflet.css'; // Add this line to import Leaflet CSS
import './styles/tailwind.css';
import ApiaryDetails from './pages/ApiaryDetails';
import HiveDetails from './pages/HiveDetails';
import InspectionForm from './pages/InspectionForm';
import InspectionReview from './pages/InspectionReview';
import Settings from './pages/Settings';
import TreatmentForm from './pages/TreatmentForm';
import AuthenticatedQueryClientProvider from './hooks/AuthenticatedQueryClientProvider';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import HiveList from './pages/HiveList';
import BoxList from './pages/BoxList';
import FeedingList from './pages/FeedingList';
import InspectionList from './pages/InspectionList';
import TreatmentList from './pages/TreatmentList';
import QueenManagement from './pages/QueenManagement';
import EquipmentPage from './pages/EquipmentPage';

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

const AppContent = ({ isOnline }) => {
  const navigate = useNavigate();

  const handleVoiceCommand = useCallback(
    (action, entity, transcript) => {
      console.log(`Received voice command: ${action} ${entity}`);
      console.log(`Full transcript: ${transcript}`);

      switch (action.toLowerCase()) {
        case 'go':
        case 'navigate':
          switch (entity.toLowerCase()) {
            case 'dashboard':
              navigate('/');
              break;
            case 'hives':
              navigate('/hives');
              break;
            case 'inspections':
              navigate('/inspections');
              break;
            case 'treatments':
              navigate('/treatments');
              break;
            case 'feedings':
              navigate('/feedings');
              break;
            case 'queen':
              navigate('/queen');
              break;
            case 'settings':
              navigate('/settings');
              break;
            default:
              console.log(`Unknown navigation target: ${entity}`);
          }
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    },
    [navigate]
  );

  return (
    <SpeechRecognitionProvider onVoiceCommand={handleVoiceCommand}>
      <div className="min-h-screen bg-hive-light">
        {!isOnline && (
          <div className="bg-yellow-500 text-white p-2 text-center">
            You are currently offline. Some features may be limited.
          </div>
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
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
                  <ApiaryDetails isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hives"
              element={
                <ProtectedRoute>
                  <HiveList isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hives/:id"
              element={
                <ProtectedRoute>
                  <HiveDetails isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hives/:id/edit"
              element={
                <ProtectedRoute>
                  <HiveDetails isOnline={isOnline} isEditing={true} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/boxes"
              element={
                <ProtectedRoute>
                  <BoxList isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedings"
              element={
                <ProtectedRoute>
                  <FeedingList isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inspections"
              element={
                <ProtectedRoute>
                  <InspectionList isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hives/:id/add-treatment"
              element={
                <ProtectedRoute>
                  <TreatmentForm isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/treatments"
              element={
                <ProtectedRoute>
                  <TreatmentList isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/queen"
              element={
                <ProtectedRoute>
                  <QueenManagement isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hives/:hiveId/add-inspection"
              element={
                <ProtectedRoute>
                  <InspectionForm isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inspections/:inspectionId"
              element={
                <ProtectedRoute>
                  <InspectionReview isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipment"
              element={
                <ProtectedRoute>
                  <EquipmentPage isOnline={isOnline} />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </div>
    </SpeechRecognitionProvider>
  );
};

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
              <AppContent isOnline={isOnline} />
            </Router>
          </AuthenticatedQueryClientProvider>
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AppWithProviders />);
