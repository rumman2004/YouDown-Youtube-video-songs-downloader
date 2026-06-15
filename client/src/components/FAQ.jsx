import { useState } from 'react';
import { Plus } from 'lucide-react';
import SectionHeading from './SectionHeading';

const FAQS = [
  {
    q: 'Is this downloader free to use?',
    a: 'Yes, completely free. There’s no sign-up, no subscription, and no limit on how many videos you can download.',
  },
  {
    q: 'What formats and qualities can I download?',
    a: 'You can download video as MP4 from 360p all the way up to 2160p (4K), depending on what the source video offers. For audio, you can extract MP3 at 128, 192, or 320 kbps.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. Everything runs in your browser. You don’t need to install any apps, extensions, or codecs — just paste a link and download.',
  },
  {
    q: 'Why are some quality options greyed out?',
    a: 'A resolution is only selectable if the original video was uploaded in that quality. If a video maxes out at 1080p, the 1440p and 4K options will be disabled.',
  },
  {
    q: 'Where do my downloaded files go?',
    a: 'They’re saved to your device’s default Downloads folder, just like any other browser download. Files are named after the video for easy searching.',
  },
  {
    q: 'Is it legal to download YouTube videos?',
    a: 'Downloading is fine for content you own, content licensed for reuse (like Creative Commons), or where you have permission. Downloading copyrighted material without permission may violate YouTube’s Terms of Service and copyright law, so please use this responsibly.',
  },
  {
    q: 'Why did my download fail?',
    a: 'Some videos can’t be downloaded — for example private, age-restricted, members-only, or region-locked videos. Double-check the link and try a different video if the problem persists.',
  },
];

function Item({ faq, open, onToggle }) {
  return (
    <div className="card-solid rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-cyprus">{faq.q}</span>
        <Plus
          className={`h-5 w-5 shrink-0 text-cyprus transition-transform duration-200 ${
            open ? 'rotate-45' : ''
          }`}
          strokeWidth={2}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm text-ink-soft leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="w-full scroll-mt-20">
      <SectionHeading
        eyebrow="Questions"
        title="Frequently asked questions"
        subtitle="Everything you need to know about downloading videos and audio."
      />

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <Item
            key={faq.q}
            faq={faq}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  );
}
