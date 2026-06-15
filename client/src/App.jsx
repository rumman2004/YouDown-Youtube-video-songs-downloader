import { useCallback, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import URLInput from './components/URLInput';
import VideoInfo from './components/VideoInfo';
import FormatSelector from './components/FormatSelector';
import DownloadButton from './components/DownloadButton';
import ProgressBar from './components/ProgressBar';
import Toast from './components/Toast';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Safety from './components/Safety';
import FAQ from './components/FAQ';
import { gsap, smoothScrollTo } from './lib/gsap';

export default function App() {
  const contentRef = useRef(null);
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [fetching, setFetching] = useState(false);

  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [selectedQuality, setSelectedQuality] = useState('1080p');

  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [indeterminate, setIndeterminate] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => setToast({ type, message }), []);
  const dismissToast = useCallback(() => setToast(null), []);

  // Smoothly scroll to a section when a nav/footer link is clicked.
  const handleNavClick = useCallback((e, targetId) => {
    e.preventDefault();
    smoothScrollTo(targetId);
  }, []);

  // Reveal content sections as they scroll into view.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 48,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });
    }, contentRef);
    return () => ctx.revert();
  }, []);

  // --- Fetch video metadata -------------------------------------------------
  const handleFetch = async () => {
    setFetching(true);
    setVideoInfo(null);
    try {
      const res = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch video info.');

      setVideoInfo(data);

      // Default to the highest available video quality.
      const firstVideo = data.formats.find((f) => f.container === 'mp4' && f.available);
      setSelectedFormat('mp4');
      setSelectedQuality(firstVideo ? firstVideo.quality : '720p');

      showToast('success', 'Video info loaded. Choose a format to download.');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setVideoInfo(null);
    setProgress(0);
  };

  // --- Download with live progress -----------------------------------------
  const handleDownload = async () => {
    if (!videoInfo) return;
    setDownloading(true);
    setIndeterminate(true);
    setProgress(0);
    setSpeed(0);
    setEta(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          format: selectedFormat,
          quality: selectedQuality,
        }),
      });

      if (!res.ok) {
        // Error responses are JSON.
        let message = 'Download failed. Please try again.';
        try {
          const data = await res.json();
          message = data.error || message;
        } catch {
          /* keep default */
        }
        throw new Error(message);
      }

      const total = Number(res.headers.get('Content-Length')) || 0;
      const disposition = res.headers.get('Content-Disposition') || '';
      const filename = parseFilename(disposition, selectedFormat);

      // Stream the response so we can show real progress, speed and ETA.
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;
      const startedAt = performance.now();
      setIndeterminate(false);

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;

        const elapsed = (performance.now() - startedAt) / 1000;
        const bps = elapsed > 0 ? received / elapsed : 0;
        setSpeed(bps);

        if (total > 0) {
          setProgress((received / total) * 100);
          const remaining = bps > 0 ? (total - received) / bps : null;
          setEta(remaining);
        }
      }

      const blob = new Blob(chunks);
      triggerBrowserDownload(blob, filename);

      setProgress(100);
      showToast('success', `Saved "${filename}" to your downloads.`);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setDownloading(false);
      setIndeterminate(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toast toast={toast} onDismiss={dismissToast} />

      {/* Navbar */}
      <nav className="w-full">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <a
            href="#top"
            onClick={(e) => handleNavClick(e, '#top')}
            className="flex items-center gap-2 font-extrabold text-cyprus text-lg"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyprus text-white">
              <Play className="h-4 w-4 fill-current" />
            </span>
            YouDown
          </a>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-ink-soft">
            <a href="#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="hover:text-cyprus transition">How it works</a>
            <a href="#safety" onClick={(e) => handleNavClick(e, '#safety')} className="hover:text-cyprus transition">Is it safe?</a>
            <a href="#faq" onClick={(e) => handleNavClick(e, '#faq')} className="hover:text-cyprus transition">FAQ</a>
          </div>
        </div>
      </nav>

      {/* Hero + downloader */}
      <header id="top" className="px-4 pt-8 sm:pt-12 pb-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-cyprus">
            Download YouTube videos &amp; audio
          </h1>
          <p className="mt-3 text-ink-soft text-base sm:text-lg">
            Paste a link, choose your quality, and save video or audio in seconds — no app, no sign-up.
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto space-y-5">
          <URLInput
            url={url}
            setUrl={setUrl}
            onFetch={handleFetch}
            loading={fetching}
            onClear={handleClear}
          />

          {videoInfo && <VideoInfo info={videoInfo} />}

          {videoInfo && (
            <FormatSelector
              formats={videoInfo.formats}
              format={selectedFormat}
              setFormat={setSelectedFormat}
              quality={selectedQuality}
              setQuality={setSelectedQuality}
            />
          )}

          {videoInfo && (
            <div className="card rounded-2xl p-5 space-y-4">
              {downloading && (
                <ProgressBar
                  progress={progress}
                  indeterminate={indeterminate}
                  speed={speed}
                  eta={eta}
                />
              )}
              <DownloadButton
                onClick={handleDownload}
                downloading={downloading}
                disabled={!selectedQuality}
                format={selectedFormat}
              />
            </div>
          )}
        </div>
      </header>

      {/* Content sections */}
      <main className="px-4" ref={contentRef}>
        <div className="mx-auto max-w-6xl space-y-20 py-16">
          <div data-reveal>
            <Features />
          </div>
          <div data-reveal>
            <HowItWorks />
          </div>
          <div data-reveal>
            <Safety />
          </div>
          <div data-reveal>
            <FAQ />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-cyprus text-sand mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-extrabold text-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand text-cyprus">
                <Play className="h-4 w-4 fill-current" />
              </span>
              YouDown
            </div>
            <div className="flex items-center gap-6 text-sm text-mint">
              <a href="#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="hover:text-sand transition">How it works</a>
              <a href="#safety" onClick={(e) => handleNavClick(e, '#safety')} className="hover:text-sand transition">Safety</a>
              <a href="#faq" onClick={(e) => handleNavClick(e, '#faq')} className="hover:text-sand transition">FAQ</a>
            </div>
          </div>
          <hr className="my-6 border-mint/20" />
          <p className="text-center text-xs text-mint/80 max-w-2xl mx-auto leading-relaxed">
            YouDown is intended for personal and educational use only. Please download only
            content you own or have permission to use, and respect copyright and YouTube&apos;s
            Terms of Service. © {2026} YouDown.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Pull a filename out of a Content-Disposition header (URL-encoded by the API).
function parseFilename(disposition, format) {
  const match = /filename="?([^"]+)"?/.exec(disposition);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
  return `download.${format}`;
}

function triggerBrowserDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
