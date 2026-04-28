// src/components/auth/LoginForm.jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LoginForm({ onLogin, isLoading: externalLoading, error: externalError }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const isLoading = externalLoading !== undefined ? externalLoading : localLoading;
  const error = externalError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onLogin) {
      setLocalLoading(true);
      try {
        await onLogin(phoneNumber, password);
      } finally {
        setLocalLoading(false);
      }
    } else {
      console.warn('No onLogin handler provided');
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo / Brand */}
      <div className="mb-8 flex justify-center">
        <div className="rounded-full bg-white p-2 shadow-md dark:bg-zinc-800">
          <Image src="/next.svg" alt="Logo" width={40} height={40} className="dark:invert" priority />
        </div>
      </div>

      {/* Login Card */}
      <div className="rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:bg-zinc-900/80 dark:shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {typeof error === 'string' ? error : error.message || 'An error occurred'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Number Field (changed from email) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 shadow-sm transition duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-blue-400"
                placeholder="0712345678"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Forgot password?
              </a>
            </div>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 shadow-sm transition duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-blue-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full transform items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don't have an account?{' '}
          <a href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Create an account
          </a>
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-500">
        Secure login – your credentials are encrypted
      </p>
    </div>
  );
}