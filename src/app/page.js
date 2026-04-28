// src/app/page.js
'use client';

import LoginForm from '@/components/auth/LoginForm';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { login, user, isLoading, error } = useAuthContext();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (phoneNumber, password) => {
    await login(phoneNumber, password);
    // No need to push here - the effect will redirect
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 font-sans dark:from-black dark:to-zinc-900">
      <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />
    </div>
  );
}