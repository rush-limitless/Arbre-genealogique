import React from 'react';
// @ts-nocheck

interface AvatarProps {
  firstName: string;
  lastName: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-10 w-10 text-sm rounded-[16px]',
  md: 'h-16 w-16 text-xl rounded-[22px]',
  lg: 'h-24 w-24 text-3xl rounded-[28px]',
  xl: 'h-32 w-32 text-4xl rounded-[36px]',
};

export function Avatar({ firstName, lastName, photoUrl, size = 'md' }: AvatarProps) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'PF';

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center overflow-hidden border border-[var(--color-line)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] shadow-[var(--shadow-card)] flex-shrink-0`}>
      {photoUrl ? (
        <img src={photoUrl} alt={`${firstName} ${lastName}`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold">{initials}</div>
      )}
    </div>
  );
}
