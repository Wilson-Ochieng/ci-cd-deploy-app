
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function RegistrationForm({ onRegister, isLoading: externalLoading, error: externalError }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('shipper'); // 'shipper' or 'transporter'
  
  // Transporter-specific fields
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [idNumber, setIdNumber] = useState('');
  
  const [localLoading, setLocalLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const isLoading = externalLoading !== undefined ? externalLoading : localLoading;
  const error = externalError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    const userData = {
      phoneNumber,
      fullName,
      password,
      role,
      ...(role === 'transporter' && { vehicleType, vehicleReg, idNumber }),
    };

    if (onRegister) {
      setLocalLoading(true);
      try {
        await onRegister(userData);
      } finally {
        setLocalLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex justify-center">
        <div className="rounded-full bg-white p-2 shadow-md dark:bg-zinc-800">
          <Image src="/next.svg" alt="Logo" width={40} height={40} className="dark:invert" priority />
        </div>
      </div>

      <div className="rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:bg-zinc-900/80 dark:shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Create an account</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Join LoadLink Kenya</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {typeof error === 'string' ? error : error.message || 'Registration failed'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="John Doe"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number</label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="0712345678"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">I am a</label>
            <div className="mt-1 flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" value="shipper" checked={role === 'shipper'} onChange={() => setRole('shipper')} />
                <span>Shipper (send goods)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="transporter" checked={role === 'transporter'} onChange={() => setRole('transporter')} />
                <span>Transporter (deliver goods)</span>
              </label>
            </div>
          </div>

          {/* Transporter-specific fields */}
          {role === 'transporter' && (
            <div className="space-y-4 border-l-2 border-blue-200 pl-4 dark:border-blue-800">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  required={role === 'transporter'}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="">Select vehicle</option>
                  <option value="pickup">Pickup</option>
                  <option value="box_truck">Box Truck</option>
                  <option value="boda">Boda Boda</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Vehicle Registration</label>
                <input
                  type="text"
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value)}
                  required={role === 'transporter'}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="KCA 123A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">National ID Number</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required={role === 'transporter'}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="12345678"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="••••••••"
            />
            {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <a href="/" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}