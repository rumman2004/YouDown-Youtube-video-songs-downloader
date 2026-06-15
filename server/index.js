import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import infoRoute from './routes/info.js';
import downloadRoute from './routes/download.js';
import { ensureYtDlp } from './utils/ytdlHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

const app = express();

// Ensure the temp downloads directory exists.
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// --- Middleware -------------------------------------------------------------
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Rate limiting: max 10 requests per 15 minutes per IP.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      'Too many requests. You have hit the limit (10 per 15 minutes). Please wait a few minutes and try again.',
  },
});
app.use('/api', limiter);

// --- Routes -----------------------------------------------------------------
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/info', infoRoute);
app.use('/api/download', downloadRoute);

// 404 handler for unknown API routes.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// --- Central error handler --------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message =
    err.message || 'An unexpected error occurred. Please try again.';
  if (status >= 500) {
    console.error('[error]', err.original || err.stack || message);
  }
  if (res.headersSent) return;
  res.status(status).json({ error: message });
});

// --- Temp file cleanup ------------------------------------------------------
function clearDownloads() {
  try {
    if (!fs.existsSync(DOWNLOADS_DIR)) return;
    for (const file of fs.readdirSync(DOWNLOADS_DIR)) {
      if (file === '.gitkeep') continue;
      try {
        fs.unlinkSync(path.join(DOWNLOADS_DIR, file));
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
}

// --- Startup ----------------------------------------------------------------
async function start() {
  try {
    console.log('[startup] Ensuring yt-dlp binary is available...');
    await ensureYtDlp();
    console.log('[startup] yt-dlp ready.');
  } catch (err) {
    console.error(
      '[startup] Failed to prepare yt-dlp binary. The server will start, but downloads will fail until this is resolved.'
    );
    console.error(err.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`\n  ✓ Server running at http://localhost:${PORT}`);
    console.log(`  ✓ Accepting requests from ${CLIENT_ORIGIN}\n`);
  });

  const shutdown = (signal) => {
    console.log(`\n[shutdown] Received ${signal}. Cleaning up...`);
    clearDownloads();
    server.close(() => {
      console.log('[shutdown] Server closed. Goodbye.');
      process.exit(0);
    });
    // Force-exit if it hangs.
    setTimeout(() => process.exit(0), 5000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
