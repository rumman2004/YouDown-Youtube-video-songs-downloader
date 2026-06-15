import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import {
  downloadToFile,
  isValidYouTubeUrl,
  getVideoInfo,
  sanitizeFilename,
} from '../utils/ytdlHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');

const router = Router();

/**
 * POST /api/download
 * Body: { url: string, format: 'mp4' | 'mp3', quality: string }
 * Downloads (and merges/transcodes) the requested file, then streams it back
 * as an attachment and deletes the temp file afterwards.
 */
router.post('/', async (req, res, next) => {
  const { url, format, quality } = req.body || {};
  const id = uuidv4();
  let producedPath = null;

  const cleanup = () => {
    if (producedPath && fs.existsSync(producedPath)) {
      fs.unlink(producedPath, () => {});
    }
  };

  try {
    if (!url || !isValidYouTubeUrl(url)) {
      return res
        .status(400)
        .json({ error: 'A valid YouTube URL is required.' });
    }
    if (format !== 'mp4' && format !== 'mp3') {
      return res
        .status(400)
        .json({ error: "Format must be either 'mp4' or 'mp3'." });
    }
    if (!quality || typeof quality !== 'string') {
      return res.status(400).json({ error: 'A quality option is required.' });
    }

    // Grab the title up front so we can name the downloaded file nicely.
    let title = 'video';
    try {
      const meta = await getVideoInfo(url.trim());
      title = meta.title;
    } catch {
      /* non-fatal — fall back to a generic name */
    }

    const { filePath, ext } = await downloadToFile({
      url: url.trim(),
      format,
      quality,
      outDir: DOWNLOADS_DIR,
      id,
    });
    producedPath = filePath;

    const safeTitle = sanitizeFilename(title);
    const downloadName = `${safeTitle}_youdown.${ext}`;
    const contentType = ext === 'mp3' ? 'audio/mpeg' : 'video/mp4';

    const stat = fs.statSync(filePath);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(downloadName)}"`
    );

    const stream = fs.createReadStream(filePath);

    stream.on('error', (err) => {
      cleanup();
      if (!res.headersSent) next(err);
      else res.destroy(err);
    });

    // Remove the temp file once it has been fully streamed (or the client bails).
    stream.on('close', cleanup);
    res.on('close', cleanup);

    stream.pipe(res);
  } catch (err) {
    cleanup();
    return next(err);
  }
});

export default router;
