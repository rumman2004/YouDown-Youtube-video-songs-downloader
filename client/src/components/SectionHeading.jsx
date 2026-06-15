/** Shared centered heading for content sections. */
export default function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-8">
      {eyebrow && (
        <span className="inline-block rounded-full bg-cyprus/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyprus">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-cyprus">{title}</h2>
      {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
    </div>
  );
}
