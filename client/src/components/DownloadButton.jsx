import { Download, Loader2 } from 'lucide-react';

/**
 * Large primary call-to-action for starting a download.
 * Props: { onClick, downloading, disabled, format }
 */
export default function DownloadButton({ onClick, downloading, disabled, format }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || downloading}
      className="group relative w-full overflow-hidden rounded-xl px-6 py-4 text-lg font-semibold text-cyprus
                 bg-gradient-to-r from-gold to-gold-600
                 shadow-lg shadow-gold/30 transition-all duration-200
                 hover:shadow-gold/50 hover:brightness-105
                 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100
                 focus:outline-none focus:ring-2 focus:ring-cyprus focus:ring-offset-2 focus:ring-offset-sand"
    >
      <span className="flex items-center justify-center gap-2">
        {downloading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Downloading…
          </>
        ) : (
          <>
            <Download className="h-5 w-5" strokeWidth={2} />
            Download {format === 'mp3' ? 'MP3' : 'MP4'}
          </>
        )}
      </span>
    </button>
  );
}
