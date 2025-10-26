import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import useAudioFeedback from '../../utils/audioFeedback';
import { speakText } from '../../utils/pollyService';
import GuestModeButton from './GuestModeButton';
import { AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-beeswax-50 via-honey-50 to-wood-50 dark:from-wood-900 dark:via-wood-800 dark:to-forest-900 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-2xl border-wood-200 dark:border-wood-700">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img className="h-24 w-auto object-contain" src={logo} alt="Mellifera" />
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">
              {isRegistering ? 'Create an account' : 'Welcome back'}
            </CardTitle>
            <CardDescription>
              {isRegistering 
                ? 'Enter your details to create your account' 
                : 'Sign in to manage your hives'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" size="lg">
              {isRegistering ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Google
            </Button>

            <Button
              variant="outline"
              onClick={handleFacebookLogin}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                  clipRule="evenodd"
                />
              </svg>
              Facebook
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <GuestModeButton />
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
