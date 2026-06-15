import { Zap, FileVideo, Rocket, ShieldCheck } from 'lucide-react';

/** Quick value-proposition cards shown below the downloader. */
const FEATURES = [
  {
    Icon: Zap,
    title: 'Best Quality',
    desc: 'Download in up to 4K (2160p) with video and audio merged into one file.',
  },
  {
    Icon: FileVideo,
    title: 'Video & Audio',
    desc: 'Grab full MP4 video or extract crisp MP3 audio at up to 320 kbps.',
  },
  {
    Icon: Rocket,
    title: 'Fast & Free',
    desc: 'No sign-up, no limits per file. Just paste, pick, and download.',
  },
  {
    Icon: ShieldCheck,
    title: 'Private & Safe',
    desc: 'Files are processed on the fly and deleted right after download.',
  },
];

export default function Features() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="card rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/40 text-cyprus">
              <Icon className="h-6 w-6" strokeWidth={2} />
            </div>
            <h3 className="mt-3 font-bold text-cyprus">{title}</h3>
            <p className="mt-1 text-sm text-ink-soft leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
