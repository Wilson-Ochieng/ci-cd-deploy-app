'use client';

import RegistrationForm from '@/components/auth/RegistrationForm';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RegisterPage() {
  const { register, user, isLoading, error } = useAuthContext();
  const router = useRouter();
  const [registerError, setRegisterError] = useState(null);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleRegister = async (userData) => {
    try {
      setRegisterError(null);
      await register(userData);
      // AuthContext will update user, effect will redirect
    } catch (err) {
      setRegisterError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 font-sans dark:from-black dark:to-zinc-900">
      <RegistrationForm onRegister={handleRegister} isLoading={isLoading} error={registerError || error} />
    </div>
  );
}