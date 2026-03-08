import React from 'react';
// @ts-nocheck

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
}: ModalProps) {
  if (!isOpen) return null;

  const confirmClass =
    variant === 'danger' ? 'app-button-danger' : variant === 'warning' ? 'app-button-secondary' : 'app-button-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4 backdrop-blur-md" onClick={onClose}>
      <div className="app-panel w-full max-w-md px-6 py-6 sm:px-7 sm:py-7" onClick={(e) => e.stopPropagation()}>
        <div className="app-chip mb-4 w-fit">{variant === 'danger' ? 'Confirmation' : 'Action'}</div>
        <h2 className="font-display text-3xl text-[var(--color-text)]">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="app-button-ghost">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={confirmClass}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
