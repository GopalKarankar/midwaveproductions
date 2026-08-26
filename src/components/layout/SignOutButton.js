'use client';

import { useState } from 'react';

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });

      if (!response.ok) {
        throw new Error(`Logout failed: ${response.status} ${response.statusText}`);
      }

      // Force a hard navigation to / — full page reload discards Router Cache and clears all client state.
      // This ensures no stale authenticated content can be restored from memory or disk cache.
      window.location.assign('/');
    } catch (err) {
      setIsSigningOut(false);
      setError(err.message || 'Logout failed');
      console.error('Logout error:', err);
    }
  };

  return (
    <div>
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="text-xs font-mono tracking-widest uppercase text-error hover:text-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSigningOut ? 'Signing out...' : 'Logout'}
      </button>
      {error && (
        <div className="text-xs font-mono uppercase text-error mt-2">
          {error}
        </div>
      )}
    </div>
  );
}
