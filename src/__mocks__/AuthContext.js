import React from 'react';

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const value = {
    isAuthenticated: true,
    token: 'mock-token',
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  return React.useContext(AuthContext);
};