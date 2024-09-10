import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../components/Login';
import { AuthContext } from '../context/AuthContext';
import { speakText } from '../utils/pollyService';

// Mock the AuthContext and Polly service
jest.mock('../context/AuthContext', () => ({
  AuthContext: React.createContext(null),
}));
jest.mock('../utils/pollyService', () => ({
  speakText: jest.fn(),
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    mockLogin.mockClear();
    mockNavigate.mockClear();
    speakText.mockClear();

    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
  });

  const renderLogin = (loginValue = mockLogin) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ login: loginValue }}>
          <Login />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  test('renders login form', () => {
    renderLogin();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('allows entering email and password', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('submits the form with entered data and greets user', async () => {
    const user = { name: 'Test User' };
    mockLogin.mockResolvedValue(user);
    renderLogin();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(speakText).toHaveBeenCalledWith('Welcome back, Test User!');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('does not greet user if name is not provided', async () => {
    const user = { email: 'test@example.com' };
    mockLogin.mockResolvedValue(user);
    renderLogin();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(speakText).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('displays error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    renderLogin();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Authentication failed. Please try again./i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(speakText).not.toHaveBeenCalled();
    });
  });

  test('switches between login and register modes', async () => {
    renderLogin();
    const switchModeButton = screen.getByText(/Don't have an account\? Register/i);
    
    fireEvent.click(switchModeButton);
    expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    
    const switchBackButton = screen.getByText(/Already have an account\? Sign in/i);
    fireEvent.click(switchBackButton);
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
  });
});
