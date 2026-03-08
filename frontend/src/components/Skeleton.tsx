import React from 'react';
// @ts-nocheck

export function CardSkeleton() {
  return (
    <div className="app-panel animate-pulse p-5">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-[20px] bg-[var(--color-accent-soft)]" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 rounded-full bg-[var(--color-accent-soft)]" />
          <div className="h-4 w-1/2 rounded-full bg-[var(--color-accent-soft)]" />
          <div className="h-4 w-2/3 rounded-full bg-[var(--color-accent-soft)]" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
