import React from 'react';
// @ts-nocheck

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;
const toastListeners: ((toast: Toast) => void)[] = [];

export const toast = {
  success: (message: string) => {
    const t = { id: toastId++, message, type: 'success' as const };
    toastListeners.forEach((fn) => fn(t));
  },
  error: (message: string) => {
    const t = { id: toastId++, message, type: 'error' as const };
    toastListeners.forEach((fn) => fn(t));
  },
  info: (message: string) => {
    const t = { id: toastId++, message, type: 'info' as const };
    toastListeners.forEach((fn) => fn(t));
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    };
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-slide-in min-w-[260px] rounded-[22px] border px-4 py-3 shadow-[var(--shadow-card)] backdrop-blur-xl ${
            t.type === 'success'
              ? 'border-emerald-200/50 bg-emerald-50/90 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/80 dark:text-emerald-100'
              : t.type === 'error'
                ? 'border-red-200/50 bg-red-50/90 text-red-900 dark:border-red-900/50 dark:bg-red-950/80 dark:text-red-100'
                : 'border-[var(--color-line)] bg-[var(--color-surface-strong)] text-[var(--color-text)]'
          }`}
        >
          <div className="text-xs uppercase tracking-[0.24em] opacity-70">{t.type}</div>
          <div className="mt-1 text-sm font-medium">{t.message}</div>
        </div>
      ))}
    </div>
  );
}
