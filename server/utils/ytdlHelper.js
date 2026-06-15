import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import YTDlpWrap from 'yt-dlp-wrap';
import ffmpegStatic from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// yt-dlp-wrap ships as a CommonJS module whose default export is the class.
const YTDlp = YTDlpWrap.default || YTDlpWrap;

const BIN_DIR = path.join(__dirname, '..', 'bin');
const BINARY_NAME = os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const BINARY_PATH = path.join(BIN_DIR, BINARY_NAME);

// ffmpeg-static returns the absolute path to a bundled ffmpeg binary.
export const FFMPEG_PATH = ffmpegStatic;

let ytDlp = null;

/**
 * Ensure the yt-dlp binary exists locally, downloading it from GitHub on first
 * run. Returns a ready-to-use YTDlpWrap instance.
 */
export async function ensureYtDlp() {
  if (ytDlp) return ytDlp;

  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }

  if (!fs.existsSync(BINARY_PATH)) {
    console.log('[yt-dlp] Binary not found — downloading latest release...');
    await YTDlp.downloadFromGithub(BINARY_PATH);
    console.log('[yt-dlp] Download complete:', BINARY_PATH);
  }

  // Make sure it is executable on POSIX systems.
  if (os.platform() !== 'win32') {
    try {
      fs.chmodSync(BINARY_PATH, 0o755);
    } catch {
      /* best effort */
    }
  }

  ytDlp = new YTDlp(BINARY_PATH);
  return ytDlp;
}

const YT_URL_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)[\w-]{11}.*$/;

export function isValidYouTubeUrl(url) {
  if (typeof url !== 'string') return false;
  return YT_URL_REGEX.test(url.trim());
}

/** Strip characters that are illegal in filenames across platforms. */
export function sanitizeFilename(name) {
  return (name || 'video')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'video';
}

/** Human-readable HH:MM:SS from a duration in seconds. */
export function formatDuration(seconds) {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// Quality tiers the UI exposes.
const VIDEO_HEIGHTS = [
  { height: 2160, label: '2160p (4K)' },
  { height: 1440, label: '1440p' },
  { height: 1080, label: '1080p' },
  { height: 720, label: '720p' },
  { height: 480, label: '480p' },
  { height: 360, label: '360p' },
];

const AUDIO_BITRATES = [320, 192, 128];

/**
 * Fetch metadata for a video and build the format list the frontend expects.
 */
export async function getVideoInfo(url) {
  const wrap = await ensureYtDlp();

  let info;
  try {
    info = await wrap.getVideoInfo(url);
  } catch (err) {
    throw classifyYtDlpError(err);
  }

  const rawFormats = Array.isArray(info.formats) ? info.formats : [];

  // Track the largest available video height and best audio bitrate so we can
  // mark UI options as available / unavailable and estimate file sizes.
  const videoFormats = rawFormats.filter(
    (f) => f.vcodec && f.vcodec !== 'none' && f.height
  );
  const maxHeight = videoFormats.reduce((m, f) => Math.max(m, f.height || 0), 0);

  const bestAudioBitrate = rawFormats
    .filter((f) => f.acodec && f.acodec !== 'none')
    .reduce((m, f) => Math.max(m, f.abr || 0), 0);

  const duration = info.duration || 0;

  const formats = [];

  // Video (mp4) options — available when the source has at least that height.
  for (const tier of VIDEO_HEIGHTS) {
    const available = maxHeight >= tier.height;

    // Best matching progressive/adaptive video stream for a size estimate.
    const match = videoFormats
      .filter((f) => f.height <= tier.height)
      .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

    const videoSize = match ? match.filesize || match.filesize_approx || 0 : 0;
    // Add a rough audio track allowance (~128kbps) to the merged estimate.
    const audioSize = duration ? Math.round((128_000 / 8) * duration) : 0;

    formats.push({
      itag: `mp4-${tier.height}`,
      quality: tier.label,
      height: tier.height,
      container: 'mp4',
      hasAudio: true,
      hasVideo: true,
      available,
      filesize: available && videoSize ? videoSize + audioSize : 0,
    });
  }

  // Audio (mp3) options — always available because we transcode from bestaudio.
  for (const bitrate of AUDIO_BITRATES) {
    const estimate = duration ? Math.round((bitrate * 1000 / 8) * duration) : 0;
    formats.push({
      itag: `mp3-${bitrate}`,
      quality: `${bitrate}kbps`,
      bitrate,
      container: 'mp3',
      hasAudio: true,
      hasVideo: false,
      available: bestAudioBitrate > 0 || rawFormats.length > 0,
      filesize: estimate,
    });
  }

  return {
    title: info.title || 'Untitled',
    thumbnail: info.thumbnail || (info.thumbnails?.slice(-1)[0]?.url ?? ''),
    duration,
    durationString: formatDuration(duration),
    uploader: info.uploader || info.channel || 'Unknown',
    viewCount: info.view_count || 0,
    formats,
  };
}

/**
 * Build the yt-dlp format selector string for a requested mp4 quality.
 */
function buildVideoSelector(height) {
  if (!height) {
    return 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
  }
  return (
    `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/` +
    `bestvideo[height<=${height}]+bestaudio/` +
    `best[height<=${height}][ext=mp4]/best[height<=${height}]/best`
  );
}

/**
 * Download a video or audio file to disk via yt-dlp and return the final path.
 *
 * @param {object} opts
 * @param {string} opts.url      Source YouTube URL
 * @param {'mp4'|'mp3'} opts.format
 * @param {string} opts.quality  e.g. "1080p" or "320kbps"
 * @param {string} opts.outDir   Directory to write into
 * @param {string} opts.id       Unique id used as the base filename
 * @param {(p: object) => void} [opts.onProgress] Progress callback
 * @returns {Promise<{filePath: string, ext: string}>}
 */
export async function downloadToFile({ url, format, quality, outDir, id, onProgress }) {
  const wrap = await ensureYtDlp();
  const ext = format === 'mp3' ? 'mp3' : 'mp4';
  const outputTemplate = path.join(outDir, `${id}.%(ext)s`);

  let args = ['-o', outputTemplate, '--no-playlist', '--no-warnings', '--no-part'];

  if (FFMPEG_PATH) {
    args.push('--ffmpeg-location', FFMPEG_PATH);
  }

  if (format === 'mp3') {
    const bitrate = parseInt(String(quality).replace(/\D/g, ''), 10) || 320;
    args.push(
      '-f',
      'bestaudio/best',
      '-x',
      '--audio-format',
      'mp3',
      '--audio-quality',
      `${bitrate}K`
    );
  } else {
    const height = parseInt(String(quality).replace(/\D/g, ''), 10) || 1080;
    args.push('-f', buildVideoSelector(height), '--merge-output-format', 'mp4');
  }

  args.push(url);

  await new Promise((resolve, reject) => {
    const proc = wrap.exec(args);

    proc.on('progress', (progress) => {
      if (onProgress) onProgress(progress);
    });

    proc.on('error', (err) => reject(classifyYtDlpError(err)));

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`yt-dlp exited with code ${code}`));
    });
  });

  const expectedPath = path.join(outDir, `${id}.${ext}`);
  if (fs.existsSync(expectedPath)) {
    return { filePath: expectedPath, ext };
  }

  // Fallback: yt-dlp occasionally picks a different container — find our id.
  const produced = fs
    .readdirSync(outDir)
    .filter((f) => f.startsWith(id))
    .map((f) => path.join(outDir, f));

  if (produced.length > 0) {
    return { filePath: produced[0], ext: path.extname(produced[0]).slice(1) };
  }

  throw new Error('Download finished but no output file was produced.');
}

/**
 * Translate raw yt-dlp errors into friendly, actionable messages.
 */
export function classifyYtDlpError(err) {
  const msg = (err && (err.stderr || err.message || String(err))) || '';
  const lower = msg.toLowerCase();

  if (lower.includes('private video')) {
    return Object.assign(new Error('This video is private and cannot be downloaded.'), {
      status: 403,
    });
  }
  if (lower.includes('age') && lower.includes('restrict')) {
    return Object.assign(
      new Error('This video is age-restricted and cannot be downloaded without sign-in.'),
      { status: 403 }
    );
  }
  if (lower.includes('sign in') || lower.includes('confirm your age')) {
    return Object.assign(
      new Error('This video requires sign-in (age-restricted or members-only).'),
      { status: 403 }
    );
  }
  if (lower.includes('unavailable') || lower.includes('video unavailable')) {
    return Object.assign(new Error('This video is unavailable or has been removed.'), {
      status: 404,
    });
  }
  if (lower.includes('timed out') || lower.includes('timeout') || lower.includes('etimedout')) {
    return Object.assign(
      new Error('The request timed out. Please check your connection and try again.'),
      { status: 504 }
    );
  }
  if (lower.includes('is not a valid url') || lower.includes('unsupported url')) {
    return Object.assign(new Error('That does not look like a valid YouTube URL.'), {
      status: 400,
    });
  }

  return Object.assign(
    new Error('Failed to process the video. It may be unavailable or region-locked.'),
    { status: 502, original: msg }
  );
}
