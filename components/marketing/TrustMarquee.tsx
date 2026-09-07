const trades = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Salons",
  "Auto detail",
  "Roofing",
  "Landscaping",
  "Dental",
  "Cleaning",
  "Locksmith",
];

export function TrustMarquee() {
  const row = [...trades, ...trades];

  return (
    <section className="border-y border-[var(--reflex-border)] bg-[var(--reflex-surface)] py-8">
      <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--reflex-muted)]">
        Built for local service businesses
      </p>
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--reflex-surface)] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--reflex-surface)] to-transparent"
        />
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap px-4">
          {row.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="font-[family-name:var(--font-syne)] text-lg tracking-tight text-[var(--reflex-ink)]/45"
              style={{ fontWeight: 700 }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
