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
    toastListeners.forEach(fn => fn(t));
  },
  error: (message: string) => {
    const t = { id: toastId++, message, type: 'error' as const };
    toastListeners.forEach(fn => fn(t));
  },
  info: (message: string) => {
    const t = { id: toastId++, message, type: 'info' as const };
    toastListeners.forEach(fn => fn(t));
  }
};

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white animate-slide-in ${
            t.type === 'success' ? 'bg-green-600' :
            t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
