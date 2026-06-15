import { useState } from 'react';
import { Link2, Loader2, X } from 'lucide-react';

const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)[\w-]{11}.*$/;

/**
 * URL entry with paste, validate-on-blur, fetch, and clear.
 * Props: { url, setUrl, onFetch, loading, onClear }
 */
export default function URLInput({ url, setUrl, onFetch, loading, onClear }) {
  const [touched, setTouched] = useState(false);

  const invalid = touched && url.trim().length > 0 && !YT_REGEX.test(url.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (url.trim() && YT_REGEX.test(url.trim())) onFetch();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="card rounded-2xl p-2 flex flex-col sm:flex-row gap-2 items-stretch">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyprus/60 pointer-events-none">
            <Link2 className="h-5 w-5" strokeWidth={2} />
          </span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Paste a YouTube link here"
            className="w-full bg-transparent pl-11 pr-10 py-3.5 text-base text-ink placeholder-ink-soft/60
                       outline-none rounded-xl"
            spellCheck="false"
            autoComplete="off"
          />
          {url.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setTouched(false);
                onClear();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-cyprus transition"
              aria-label="Clear input"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="shrink-0 rounded-xl px-6 py-3.5 font-semibold text-white
                     bg-cyprus hover:bg-cyprus-600
                     transition disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2 min-w-35"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Downloading…
            </>
          ) : (
            'Download'
          )}
        </button>
      </div>

      {invalid && (
        <p className="mt-2 ml-2 text-sm text-coral">
          Please enter a valid YouTube URL.
        </p>
      )}
    </form>
  );
}
