// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import localForage from 'localforage';
import axios from 'axios';

// Set the base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:5050';
const API_BASE_URL = '/api'; // Adjust this if your API has a different base URL

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const isAuthenticated = useMemo(() => !!user && !!token, [user, token]);

  const clearAuthData = useCallback(async () => {
    await localForage.removeItem('authToken');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('AuthContext: Loading user');
        const storedToken = await localForage.getItem('authToken');
        if (storedToken) {
          console.log('AuthContext: Stored token found');
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          await fetchUser();
        } else {
          console.log('AuthContext: No stored token found');
        }
      } catch (error) {
        console.error('AuthContext: Error loading user:', error);
        setAuthError('Failed to load user data. Please try logging in again.');
        await clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [clearAuthData]);

  const fetchUser = async () => {
    try {
      console.log('AuthContext: Fetching user data');
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      setUser(response.data.user);
      console.log('AuthContext: User data fetched successfully');
    } catch (error) {
      console.error('AuthContext: Error fetching user:', error);
      setAuthError('Failed to fetch user data. Please try logging in again.');
      await clearAuthData();
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login');
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token: newToken } = response.data;
      setToken(newToken);
      await localForage.setItem('authToken', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      await fetchUser();
      console.log('AuthContext: Login successful');
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      setAuthError('Login failed. Please check your credentials and try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out');
      await clearAuthData();
      console.log('AuthContext: Logout successful');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      setAuthError('Failed to log out. Please try again.');
    }
  };

  // Add interceptor to handle token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          console.log('AuthContext: Received 401 error, logging out');
          await logout();
          setAuthError('Your session has expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      token,
      setToken,
      login,
      logout,
      fetchUser,
      isLoading,
      isAuthenticated,
      authError,
      setAuthError,
    }),
    [user, token, login, logout, fetchUser, isLoading, isAuthenticated, authError]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export { useAuthContext, AuthContext, AuthProvider };
