import { User, Clock, Eye } from 'lucide-react';

/**
 * Displays fetched video metadata with a fade-in animation.
 * Props: { info: { title, thumbnail, uploader, durationString, viewCount } }
 */
export default function VideoInfo({ info }) {
  if (!info) return null;

  return (
    <div className="card rounded-2xl p-4 sm:p-5 animate-fade-in flex flex-col sm:flex-row gap-5">
      <div className="relative shrink-0 overflow-hidden rounded-xl sm:w-64 w-full aspect-video bg-cyprus/10">
        {info.thumbnail ? (
          <img
            src={info.thumbnail}
            alt={info.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-soft">No preview</div>
        )}
        {info.durationString && (
          <span className="absolute bottom-2 right-2 rounded bg-cyprus/90 px-1.5 py-0.5 text-xs font-medium text-white">
            {info.durationString}
          </span>
        )}
      </div>

      <div className="flex flex-col justify-center min-w-0">
        <h2 className="text-lg sm:text-xl font-bold text-cyprus leading-snug line-clamp-3">
          {info.title}
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-cyprus" strokeWidth={2} /> {info.uploader}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-cyprus" strokeWidth={2} /> {info.durationString}
          </span>
          {info.viewCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-cyprus" strokeWidth={2} />{' '}
              {Intl.NumberFormat('en', { notation: 'compact' }).format(info.viewCount)} views
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
