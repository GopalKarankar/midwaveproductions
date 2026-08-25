'use client';

import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-xs font-mono tracking-widest uppercase text-error hover:text-accent-hover transition-colors"
    >
      Logout
    </button>
  );
}
