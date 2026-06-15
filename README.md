# 🎬 YouTube Video & Audio Downloader

A fully-featured, modern web app to download YouTube videos (MP4) and audio (MP3)
in the best available quality. Built with **React + Vite + Tailwind CSS v4** on the
front end and **Node.js + Express + yt-dlp** on the back end.

> ⚠️ **For personal/educational use only.** Downloading content may violate
> YouTube's Terms of Service and copyright law. You are responsible for how you
> use this tool.

---

## ✨ Features

- 🎥 **MP4 video** downloads — 360p up to 2160p (4K), video + audio merged with ffmpeg
- 🎵 **MP3 audio** extraction — 128 / 192 / 320 kbps via ffmpeg
- 🚀 **Best-quality** stream selection powered by the `yt-dlp` binary
- 📊 Live **progress bar** with download speed and ETA
- 🪟 Modern **glassmorphism** dark UI, fully responsive (mobile-first)
- 🔒 Rate limiting, request validation, and friendly error handling
- 📦 **Zero manual setup** — the `yt-dlp` binary and `ffmpeg` are downloaded/bundled automatically

---

## 📋 Prerequisites

- **Node.js 18+** (tested on Node 22)
- That's it. You do **not** need to install `yt-dlp` or `ffmpeg` manually:
  - `yt-dlp` is auto-downloaded to `server/bin/` on first server start
  - `ffmpeg` is provided by the `ffmpeg-static` npm package

---

## 🛠️ Installation

```bash
# 1. Clone / open the project
cd youtube-downloader

# 2. Install dependencies for root, server, and client
npm run install:all
```

> The first time the server starts it downloads the latest `yt-dlp` binary
> (~30 MB). You can also do this ahead of time with `npm run setup`.

---

## ▶️ Running in Development

From the project root, start **both** the server and client together:

```bash
npm run dev
```

- Client (Vite): http://localhost:5173
- Server (Express): http://localhost:3001

The Vite dev server proxies all `/api/*` requests to the Express backend, so you
only need to open **http://localhost:5173**.

You can also run each side independently:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

---

## 🚢 Production Build

```bash
# Build the optimized client bundle into client/dist/
npm run build

# Start the server
npm start
```

Serve `client/dist/` with any static host (or extend the Express server to serve
it) and point it at the running API.

---

## 🔌 API Documentation

Base URL: `http://localhost:3001/api`
Rate limit: **10 requests / 15 minutes / IP**

### `POST /api/info`

Fetch metadata and available formats for a video.

**Request body**

```json
{ "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
```

**Response `200`**

```json
{
  "title": "Never Gonna Give You Up",
  "thumbnail": "https://i.ytimg.com/...",
  "duration": 213,
  "durationString": "3:33",
  "uploader": "Rick Astley",
  "viewCount": 1500000000,
  "formats": [
    {
      "itag": "mp4-1080",
      "quality": "1080p",
      "container": "mp4",
      "hasAudio": true,
      "hasVideo": true,
      "available": true,
      "filesize": 52428800
    },
    {
      "itag": "mp3-320",
      "quality": "320kbps",
      "container": "mp3",
      "hasAudio": true,
      "hasVideo": false,
      "available": true,
      "filesize": 8519680
    }
  ]
}
```

### `POST /api/download`

Download and stream the requested file as an attachment.

**Request body**

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "format": "mp4",
  "quality": "1080p"
}
```

- `format`: `"mp4"` or `"mp3"`
- `quality`: e.g. `"1080p"`, `"720p"`, `"320kbps"`

**Response `200`**: binary stream with headers

```
Content-Type: video/mp4 | audio/mpeg
Content-Disposition: attachment; filename="VideoTitle_1080p.mp4"
Content-Length: <bytes>
```

### Error responses

All errors return JSON: `{ "error": "Friendly message" }`

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| 400    | Invalid URL / bad parameters             |
| 403    | Private / age-restricted video           |
| 404    | Video unavailable or removed             |
| 429    | Rate limit exceeded                      |
| 502    | yt-dlp processing failure / region-lock  |
| 504    | Network timeout                          |

### `GET /api/health`

Simple health check → `{ "status": "ok" }`

---

## 📁 Folder Structure

```
youtube-downloader/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── URLInput.jsx        # URL entry + validation
│   │   │   ├── VideoInfo.jsx       # Thumbnail + metadata card
│   │   │   ├── FormatSelector.jsx  # MP4/MP3 toggle + quality grid
│   │   │   ├── DownloadButton.jsx  # Primary CTA
│   │   │   ├── ProgressBar.jsx     # Live progress / speed / ETA
│   │   │   └── Toast.jsx           # Notifications
│   │   ├── lib/format.js           # Byte/speed/ETA formatters
│   │   ├── App.jsx                 # State + download streaming logic
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind v4 + theme + glass styles
│   ├── index.html
│   ├── vite.config.js              # /api proxy → :3001
│   ├── tailwind.config.js
│   └── package.json
├── server/                  # Node.js + Express backend
│   ├── routes/
│   │   ├── info.js          # POST /api/info
│   │   └── download.js      # POST /api/download
│   ├── utils/
│   │   └── ytdlHelper.js    # yt-dlp wrapper, format building, errors
│   ├── scripts/setup.js     # Downloads the yt-dlp binary
│   ├── bin/                 # yt-dlp binary (auto-created)
│   ├── downloads/           # Temp files (auto-cleaned)
│   ├── index.js             # Express entry + middleware + shutdown
│   └── package.json
├── package.json             # Root scripts (concurrently)
└── README.md
```

---

## ⚙️ How It Works

1. **Fetch info** — the server calls `yt-dlp --dump-json` to read metadata and
   builds a normalized list of MP4 resolutions and MP3 bitrates, marking which
   are actually available for that video.
2. **Download** — for MP4 the server selects
   `bestvideo[height<=N][ext=mp4]+bestaudio[ext=m4a]` and merges with ffmpeg;
   for MP3 it extracts `bestaudio` and transcodes to MP3 at the chosen bitrate.
3. **Stream** — the finished file is streamed to the browser with the proper
   `Content-Disposition`, and the temp file is deleted afterwards. The frontend
   reads the stream to display real-time progress, speed, and ETA.
4. **Cleanup** — temp downloads are removed after each request and on server
   shutdown (`SIGINT` / `SIGTERM`).

---

## 🧰 Tech Stack

| Layer    | Tech                                                             |
| -------- | --------------------------------------------------------------- |
| Frontend | React 19, Vite 6, Tailwind CSS v4                               |
| Backend  | Node.js, Express 4, yt-dlp-wrap, fluent-ffmpeg, ffmpeg-static   |
| Tooling  | nodemon, concurrently, morgan, express-rate-limit, dotenv, uuid |

---

## 🩺 Troubleshooting

- **"Failed to prepare yt-dlp binary"** — check your internet connection and
  re-run `npm run setup` (server downloads from GitHub releases).
- **Downloads fail for some videos** — age-restricted, private, or region-locked
  videos cannot be downloaded without authentication.
- **Slow first download** — `yt-dlp` may self-update; subsequent runs are faster.
- **Port already in use** — change `PORT` in `server/.env` (copy from
  `.env.example`) and update the proxy target in `client/vite.config.js`.
