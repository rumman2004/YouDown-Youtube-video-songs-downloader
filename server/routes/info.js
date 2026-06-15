import { Router } from 'express';
import { getVideoInfo, isValidYouTubeUrl } from '../utils/ytdlHelper.js';

const router = Router();

/**
 * POST /api/info
 * Body: { url: string }
 * Returns video metadata and the list of available formats.
 */
router.post('/', async (req, res, next) => {
  try {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'A YouTube URL is required.' });
    }

    if (!isValidYouTubeUrl(url)) {
      return res
        .status(400)
        .json({ error: 'That does not look like a valid YouTube URL.' });
    }

    const info = await getVideoInfo(url.trim());
    return res.json(info);
  } catch (err) {
    return next(err);
  }
});

export default router;
