// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import localForage from 'localforage';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = await localForage.getItem('authToken');
      if (token) {
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token } = response.data;
    await localForage.setItem('authToken', token);
    const userResponse = await axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(userResponse.data.user);
  };

  const logout = async () => {
    await localForage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
