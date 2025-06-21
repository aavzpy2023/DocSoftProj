import React, { useState } from 'react';
import Button from './Button';
import { User } from '../types';
import { APP_TITLE } from '../constants';
import { loginUser } from '../services/apiService'; // Changed to static import

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  setLoginError: (message: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, setLoginError, isLoading, setIsLoading }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Removed: const { loginUser } = await import('../services/apiService');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setLoginError('');
    try {
      const result = await loginUser({ email, password });
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setLoginError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-6">{APP_TITLE}</h1>
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          <div>
            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;