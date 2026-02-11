import React from 'react';
// @ts-nocheck

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
