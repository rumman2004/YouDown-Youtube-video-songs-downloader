import { formatBytes } from '../lib/format';

/**
 * Format toggle (MP4 / MP3) plus a quality selector with size estimates.
 * Unavailable qualities are shown greyed out and disabled.
 *
 * Props: { formats, format, setFormat, quality, setQuality }
 */
export default function FormatSelector({ formats, format, setFormat, quality, setQuality }) {
  const videoOptions = formats.filter((f) => f.container === 'mp4');
  const audioOptions = formats.filter((f) => f.container === 'mp3');
  const options = format === 'mp4' ? videoOptions : audioOptions;

  const pick = (nextFormat) => {
    setFormat(nextFormat);
    const list = nextFormat === 'mp4' ? videoOptions : audioOptions;
    const firstAvailable = list.find((o) => o.available) || list[0];
    if (firstAvailable) setQuality(firstAvailable.quality);
  };

  return (
    <div className="card rounded-2xl p-5 animate-fade-in space-y-5">
      {/* Format toggle */}
      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">Format</p>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-cyprus/5 p-1">
          <ToggleButton active={format === 'mp4'} onClick={() => pick('mp4')}>
            <VideoIcon /> MP4 <span className="text-xs opacity-70">Video</span>
          </ToggleButton>
          <ToggleButton active={format === 'mp3'} onClick={() => pick('mp3')}>
            <MusicIcon /> MP3 <span className="text-xs opacity-70">Audio</span>
          </ToggleButton>
        </div>
      </div>

      {/* Quality options */}
      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">
          {format === 'mp4' ? 'Resolution' : 'Bitrate'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {options.map((opt) => {
            const selected = quality === opt.quality;
            return (
              <button
                key={opt.itag}
                disabled={!opt.available}
                onClick={() => opt.available && setQuality(opt.quality)}
                className={[
                  'rounded-xl border px-3 py-2.5 text-left transition',
                  opt.available
                    ? 'cursor-pointer hover:border-cyprus/50'
                    : 'cursor-not-allowed opacity-40',
                  selected
                    ? 'border-cyprus bg-mint/30 ring-1 ring-cyprus'
                    : 'border-cyprus/15 bg-white/60',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyprus">{opt.quality}</span>
                  {selected && <CheckIcon />}
                </div>
                <div className="text-xs text-ink-soft mt-0.5">
                  {opt.available ? `~ ${formatBytes(opt.filesize)}` : 'Not available'}
                </div>
              </button>
            );
          })}
        </div>
        {format === 'mp4' && (
          <p className="mt-3 text-xs text-ink-soft">
            Sizes are estimates. Video + audio are merged into a single MP4 file.
          </p>
        )}
        {format === 'mp3' && (
          <p className="mt-3 text-xs text-ink-soft">
            Audio is extracted from the best available source and converted to MP3.
          </p>
        )}
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold transition',
        active
          ? 'bg-cyprus text-white shadow'
          : 'text-ink-soft hover:text-cyprus',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-cyprus" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="14" height="14" rx="2" />
      <path d="M16 9l6-3v12l-6-3" strokeLinejoin="round" />
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l10-2v13" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}
