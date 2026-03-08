import React from 'react';

interface PageLoaderProps {
  message?: string;
  fullHeight?: boolean;
}

interface PageErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  fullHeight?: boolean;
}

const wrapperClasses = (fullHeight?: boolean) =>
  fullHeight ? 'app-page flex items-center justify-center px-6' : 'flex items-center justify-center px-6 py-12';

export function PageLoader({ message = 'Chargement...', fullHeight = false }: PageLoaderProps) {
  return (
    <div className={wrapperClasses(fullHeight)}>
      <div className="app-panel flex w-full max-w-md flex-col items-center gap-6 px-8 py-10 text-center">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--color-highlight)] [animation-delay:-0.2s]" />
          <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--color-accent)] [animation-delay:-0.1s]" />
          <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--color-highlight)]" />
        </div>
        <div>
          <p className="app-kicker mb-2">Patientez</p>
          <p className="text-sm text-[var(--color-muted)]">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function PageError({
  title = 'Impossible de charger cette page',
  message,
  onRetry,
  fullHeight = false,
}: PageErrorProps) {
  return (
    <div className={wrapperClasses(fullHeight)}>
      <div className="app-panel w-full max-w-md px-8 py-10 text-center">
        <div className="app-chip mx-auto mb-4 w-fit">Erreur</div>
        <h2 className="font-display mb-3 text-2xl text-[var(--color-text)]">{title}</h2>
        <p className="mb-5 text-sm text-[var(--color-muted)]">{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="app-button-primary px-5 py-2.5">
            Reessayer
          </button>
        )}
      </div>
    </div>
  );
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      className="rounded-[22px] border px-4 py-3 text-sm text-[var(--color-danger)]"
      style={{ borderColor: 'rgba(143, 65, 53, 0.22)', background: 'rgba(143, 65, 53, 0.08)' }}
    >
      <div>{message}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 font-medium underline">
          Reessayer
        </button>
      )}
    </div>
  );
}
