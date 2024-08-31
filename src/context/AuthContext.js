// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import localForage from 'localforage';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = useMemo(() => !!user && !!token, [user, token]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = await localForage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          // Add token to default axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          await fetchUser();
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // If there's an error, clear the stored token
        await localForage.removeItem('authToken');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      // If there's an error, clear the stored token
      await localForage.removeItem('authToken');
      setToken(null);
      setUser(null);
      throw error; // Re-throw the error to be caught by the caller
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token: newToken } = response.data;
      setToken(newToken);
      await localForage.setItem('authToken', newToken);
      // Add token to default axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      await fetchUser();
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw the error to be caught by the Login component
    }
  };

  const logout = async () => {
    try {
      await localForage.removeItem('authToken');
      setUser(null);
      setToken(null);
      // Remove token from default axios headers
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        await logout();
      }
      return Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        login,
        logout,
        fetchUser,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export { useAuthContext, AuthContext, AuthProvider };
