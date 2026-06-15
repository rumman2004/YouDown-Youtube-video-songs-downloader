import { ClipboardPaste, SlidersHorizontal, Download, ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';

const STEPS = [
  {
    n: '1',
    Icon: ClipboardPaste,
    title: 'Paste the link',
    desc: 'Copy any YouTube video URL and paste it into the box above, then hit “Fetch Info”.',
  },
  {
    n: '2',
    Icon: SlidersHorizontal,
    title: 'Choose format & quality',
    desc: 'Pick MP4 video (360p–4K) or MP3 audio (up to 320 kbps). We show estimated file sizes.',
  },
  {
    n: '3',
    Icon: Download,
    title: 'Download instantly',
    desc: 'Click download. The file is prepared, streamed to your device, and saved automatically.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full scroll-mt-20">
      <SectionHeading
        eyebrow="Simple"
        title="How it works"
        subtitle="Three quick steps — no software to install, no account required."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STEPS.map(({ n, Icon, title, desc }, i) => (
          <div key={n} className="relative card rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyprus text-white">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <span className="text-3xl font-extrabold text-mint">{n}</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-cyprus">{title}</h3>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">{desc}</p>
            {i < STEPS.length - 1 && (
              <ArrowRight
                className="hidden md:block absolute top-9 -right-3 h-6 w-6 text-cyprus/30"
                strokeWidth={2}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
