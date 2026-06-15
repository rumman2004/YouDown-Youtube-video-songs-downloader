// Standalone setup script: downloads the yt-dlp binary into server/bin/.
// Run with `npm run setup`.
import { ensureYtDlp } from '../utils/ytdlHelper.js';

(async () => {
  try {
    console.log('Downloading yt-dlp binary (if needed)...');
    await ensureYtDlp();
    console.log('✓ yt-dlp is ready.');
    process.exit(0);
  } catch (err) {
    console.error('✗ Failed to download yt-dlp:', err.message);
    process.exit(1);
  }
})();
