'use client';

import Image from 'next/image';
import { useSession } from '@/hooks/useSession';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';
import { SignOutButton } from '@/components/layout/SignOutButton';

export function UserMenu({ className = '' }) {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <GoogleSignInButton className={className} />;
  }

  const picture = session.user?.picture;
  const name = session.user?.name || 'User';
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {picture ? (
        <Image
          src={picture}
          alt={name}
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface text-xs font-mono text-muted">
          {initials}
        </div>
      )}
      <SignOutButton />
    </div>
  );
}
