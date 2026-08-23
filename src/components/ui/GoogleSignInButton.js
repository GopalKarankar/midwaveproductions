'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function GoogleSignInButton({ label = 'SIGN IN WITH GOOGLE', className = '' }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/google/authorize');
      const data = await response.json();

      if (data.authUrl) {
        // Redirect to Google's authorization endpoint
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="relative w-full px-5 py-2 border border-brand-black font-display uppercase tracking-display text-highlight transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Hover sweep background — scales in from left */}
        <div className="absolute inset-0 bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-brand pointer-events-none" />
        {/* Text label — stacked above background, switches color on hover */}
        <span className="relative z-10 group-hover:text-brand-black transition-colors duration-300">
          {isLoading ? 'REDIRECTING...' : label}
        </span>
      </button>
    </div>
  );
}
