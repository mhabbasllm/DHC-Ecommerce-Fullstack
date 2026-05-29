import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';

const Login = ({ onNavigate, redirectTo }) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }

      await login(email, password, { rememberMe });

      // Login successful, redirect to target page or home
      setEmail('');
      setPassword('');
      onNavigate(redirectTo || 'home');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#f7f8fa] flex flex-col justify-center items-center py-10 px-4 font-sans relative">

      {/* Mobile Back Header */}
      <div className="absolute top-0 left-0 right-0 p-4 md:hidden flex items-center bg-white border-b border-gray-200 z-10">
        <button onClick={() => onNavigate('home')} className="text-brand-dark p-1 mr-3 cursor-pointer">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-lg font-semibold text-brand-dark">Sign in</h2>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mt-12 md:mt-0 animate-fade-in">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-dark mb-2">Welcome back</h1>
          <p className="text-sm text-brand-gray">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-brand-dark">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md outline-none text-brand-dark focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-brand-dark">Password</label>
              <span className="text-xs font-semibold text-brand-blue cursor-pointer hover:underline">Forgot password?</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md outline-none text-brand-dark focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all disabled:bg-gray-50"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-brand-dark transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 text-brand-blue border-gray-300 rounded cursor-pointer accent-brand-blue"
            />
            <label htmlFor="remember" className="text-sm text-brand-gray cursor-pointer select-none">Remember me</label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-blue hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-md transition-colors mt-2 shadow-sm"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4 text-sm text-gray-400">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span>OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Social Login */}
        <div className="mt-6 flex flex-col gap-3">
          <button className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-md text-brand-dark font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
          <button className="w-full flex items-center justify-center gap-3 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] rounded-md text-white font-medium transition-colors shadow-sm">
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5 brightness-0 invert" />
            Continue with Facebook
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-brand-gray">
          Don't have an account?{' '}
          <span
            className="text-brand-blue font-bold cursor-pointer hover:underline"
            onClick={() => onNavigate('register')}
          >
            Register now
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;
