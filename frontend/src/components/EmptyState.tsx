import React from 'react';
// @ts-nocheck

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = 'PF', title, message, action }: EmptyStateProps) {
  return (
    <div className="app-panel-muted flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] border border-[var(--color-line)] bg-[var(--color-accent-soft)] text-2xl font-semibold text-[var(--color-accent)]">
        {icon}
      </div>
      <h3 className="font-display text-3xl text-[var(--color-text)]">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">{message}</p>
      {action && (
        <button onClick={action.onClick} className="app-button-primary mt-6">
          {action.label}
        </button>
      )}
    </div>
  );
}
