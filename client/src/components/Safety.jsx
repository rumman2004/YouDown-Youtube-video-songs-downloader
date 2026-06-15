import { ServerOff, EyeOff, Sparkles, Lock } from 'lucide-react';
import SectionHeading from './SectionHeading';

const POINTS = [
  {
    Icon: ServerOff,
    title: 'No files stored',
    desc: 'Your downloads are generated on demand and deleted from our server immediately after they reach you.',
  },
  {
    Icon: EyeOff,
    title: 'No account, no tracking',
    desc: 'We never ask you to sign up. We don’t collect your history or sell your data.',
  },
  {
    Icon: Sparkles,
    title: 'Clean & ad-light',
    desc: 'No deceptive “download” buttons, no bundled software, no malware — just the file you asked for.',
  },
  {
    Icon: Lock,
    title: 'Secure connection',
    desc: 'All traffic is processed over an encrypted connection between your browser and our server.',
  },
];

export default function Safety() {
  return (
    <section id="safety" className="w-full scroll-mt-20">
      <SectionHeading
        eyebrow="Trust"
        title="Is it safe?"
        subtitle="Yes. Your privacy and security come first — here’s exactly how we handle your downloads."
      />

      <div className="card rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {POINTS.map(({ Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint/40 text-cyprus">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-bold text-cyprus">{title}</h3>
                <p className="mt-1 text-sm text-ink-soft leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-ink">
          <strong className="text-cyprus">A note on responsible use:</strong> Please only
          download videos you own or have permission to use, and respect YouTube’s Terms of
          Service and copyright law. This tool is intended for personal and educational use.
        </div>
      </div>
    </section>
  );
}
