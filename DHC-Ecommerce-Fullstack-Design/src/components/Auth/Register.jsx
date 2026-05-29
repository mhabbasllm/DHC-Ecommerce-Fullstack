import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';

const Register = ({ onNavigate }) => {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!firstName || !lastName || !email || !password) {
        setError('All fields are required');
        setIsLoading(false);
        return;
      }

      if (!termsAccepted) {
        setError('You must accept the Terms of Service and Privacy Policy');
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      await register(firstName, lastName, email, password, gender);

      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setTermsAccepted(false);
      setSuccess('Registration successful! Redirecting to login...');

      setTimeout(() => {
        onNavigate('login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#f7f8fa] flex flex-col justify-center items-center py-10 px-4 font-sans relative">

      {/* Mobile Back Header */}
      <div className="absolute top-0 left-0 right-0 p-4 md:hidden flex items-center bg-white border-b border-gray-200 z-10">
        <button onClick={() => onNavigate('login')} className="text-brand-dark p-1 mr-3 cursor-pointer">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-lg font-semibold text-brand-dark">Register</h2>
      </div>

      {/* Main Register Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mt-12 md:mt-0 animate-fade-in">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-dark mb-2">Create an account</h1>
          <p className="text-sm text-brand-gray">Join us to start shopping</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name Inputs Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* First Name */}
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-brand-dark">First name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md outline-none text-brand-dark focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-brand-dark">Last name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md outline-none text-brand-dark focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

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
            <label className="text-sm font-semibold text-brand-dark">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Create a password"
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

          {/* Gender Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-brand-dark">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md outline-none text-brand-dark focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all disabled:bg-gray-50 bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-2 mt-1">
            <input
              type="checkbox"
              id="terms"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 mt-0.5 text-brand-blue border-gray-300 rounded cursor-pointer accent-brand-blue"
            />
            <label htmlFor="terms" className="text-sm text-brand-gray cursor-pointer select-none leading-tight">
              I agree to the <span className="text-brand-blue hover:underline">Terms of Service</span> and <span className="text-brand-blue hover:underline">Privacy Policy</span>.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-blue hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-md transition-colors mt-2 shadow-sm"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-brand-gray">
          Already have an account?{' '}
          <span
            className="text-brand-blue font-bold cursor-pointer hover:underline"
            onClick={() => onNavigate('login')}
          >
            Sign in
          </span>
        </div>

      </div>
    </div>
  );
};

export default Register;
