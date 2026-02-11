import React from 'react';

interface AvatarProps {
  firstName: string;
  lastName: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-xl',
  lg: 'w-24 h-24 text-3xl',
  xl: 'w-32 h-32 text-4xl'
};

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
  'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
];

export function Avatar({ firstName, lastName, photoUrl, size = 'md' }: AvatarProps) {
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  const colorIndex = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {photoUrl ? (
        <img src={photoUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full ${bgColor} flex items-center justify-center text-white font-bold`}>
          {initials}
        </div>
      )}
    </div>
  );
}
