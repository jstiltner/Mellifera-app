import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const ProtectedRoute = ({ children }) => {
  const { user, token, isLoading, authError } = useAuthContext();

  if (isLoading) {
    console.log('ProtectedRoute: Loading user data');
    return <LoadingSpinner />;
  }

  if (authError) {
    console.error('ProtectedRoute: Auth error:', authError);
    return <ErrorMessage message={authError} />;
  }

  if (!token) {
    console.log('ProtectedRoute: No token, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (!user) {
    console.log('ProtectedRoute: Token present, but no user data');
    return <ErrorMessage message="User data not available. Please try logging in again." />;
  }

  console.log('ProtectedRoute: User authenticated, rendering protected content');
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default ProtectedRoute;
