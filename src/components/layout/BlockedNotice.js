'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function BlockedNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const isBlocked = searchParams.get('blocked') === '1';

  useEffect(() => {
    if (isBlocked && !dismissed) {
      fetch('/api/auth/logout', { method: 'POST' }).catch((err) => {
        console.error('Failed to clear cookies on block:', err);
      });
    }
  }, [isBlocked, dismissed]);

  if (!isBlocked || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-error border-b-2 border-error px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-mono uppercase tracking-widest text-white">
            Your account has been blocked. Contact us if you believe this is a mistake.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="mt-0.5 text-white hover:text-highlight transition-colors font-mono text-xs uppercase tracking-widest flex-shrink-0"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
