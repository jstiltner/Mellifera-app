import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../common/Button';
import useAudioFeedback from '../../utils/audioFeedback';
import { speakText } from '../../utils/pollyService';
import logo from '/public/logo1.png';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { playSuccessSound, playErrorSound } = useAudioFeedback();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match');
      playErrorSound();
      return;
    }

    try {
      if (isRegistering) {
        // Registration logic
        const response = await fetch('/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
          setIsRegistering(false);
          setError('Registration successful. Please log in.');
          playSuccessSound();
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Registration failed');
          playErrorSound();
        }
      } else {
        // Login logic
        const user = await login(email, password);
        playSuccessSound();

        if (user && user.name) {
          await speakText(`Welcome back, ${user.name}!`);
        }

        navigate('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(
        error.response?.data?.message || error.message || 'Authentication failed. Please try again.'
      );
      playErrorSound();
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google';
  };

  const handleFacebookLogin = () => {
    window.location.href = '/auth/facebook';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img className="mx-auto h-24 w-auto object-contain" src={logo} alt="Mellifera" />
          <h2 className="mt-6 text-center text-xl font-bold text-amber-900">
            {isRegistering ? 'Create an account' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            {isRegistering && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-black-300 placeholder-gray-500 text-amber-900 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-black-500 focus:z-10 sm:text-sm"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  isRegistering ? '' : 'rounded-t-md'
                } focus:outline-none focus:ring-black-500 focus:border-black-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-black-300 placeholder-gray-500 text-amber-900 ${
                  isRegistering ? '' : 'rounded-b-md'
                } focus:outline-none focus:ring-black-500 focus:border-black-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {isRegistering && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-black-300 placeholder-gray-500 text-black-900 rounded-b-md focus:outline-none focus:ring-black-500 focus:border-black-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div>
            <Button type="submit" className="w-full">
              {isRegistering ? 'Register' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="text-sm text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="font-medium text-black-600 hover:text-black-500"
          >
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-amber-50 text-black-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              onClick={handleGoogleLogin}
              className="bg-black text-amber-500 hover:bg-amber-50"
            >
              <span className="sr-only">Sign in with Google</span>
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
            </Button>

            <Button
              onClick={handleFacebookLogin}
              className="bg-black text-white-500 hover:bg-amber-50"
            >
              <span className="sr-only">Sign in with Facebook</span>
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
