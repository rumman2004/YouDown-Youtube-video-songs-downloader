import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

/**
 * Slide-in notification (top-right). Auto-dismisses after 4 seconds.
 * Props: { toast: { type: 'success' | 'error', message } | null, onDismiss }
 */
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed top-5 right-5 z-50 animate-slide-in">
      <div
        className={`card-solid flex items-start gap-3 rounded-xl px-4 py-3 pr-10 max-w-sm relative border-l-4 ${
          isError ? 'border-l-coral' : 'border-l-cyprus'
        }`}
        role="alert"
      >
        {isError ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-coral" strokeWidth={2} />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyprus" strokeWidth={2} />
        )}
        <p className="text-sm leading-snug text-ink">{toast.message}</p>
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-ink-soft hover:text-cyprus transition"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
