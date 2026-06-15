import { ArrowDownToLine, Timer } from 'lucide-react';
import { formatEta, formatSpeed } from '../lib/format';

/**
 * Animated progress bar. When `indeterminate` is true (the server is still
 * preparing the file), it shows a sweeping bar instead of a percentage.
 * Props: { progress: 0-100, indeterminate, speed, eta, label }
 */
export default function ProgressBar({ progress, indeterminate, speed, eta, label }) {
  const pct = Math.min(100, Math.max(0, Math.round(progress || 0)));

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-2 text-sm text-ink-soft">
        <span>{label || (indeterminate ? 'Preparing your file…' : 'Downloading…')}</span>
        {!indeterminate && <span className="font-semibold text-cyprus">{pct}%</span>}
      </div>

      <div className="h-3 w-full rounded-full bg-cyprus/10 overflow-hidden relative">
        {indeterminate ? (
          <div className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-cyprus to-mint animate-[slide-in_1.2s_ease-in-out_infinite] opacity-80" />
        ) : (
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyprus via-cyprus-600 to-mint transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>

      {!indeterminate && (speed || eta != null) && (
        <div className="flex justify-between mt-2 text-xs text-ink-soft">
          <span className="flex items-center gap-1">
            <ArrowDownToLine className="h-3.5 w-3.5" strokeWidth={2} /> {formatSpeed(speed)}
          </span>
          <span className="flex items-center gap-1">
            <Timer className="h-3.5 w-3.5" strokeWidth={2} /> {formatEta(eta)}
          </span>
        </div>
      )}
    </div>
  );
}
