const stats = [
  { label: "Missed calls", value: "24", hint: "this week" },
  { label: "Auto-texts sent", value: "21", hint: "US track" },
  { label: "Response rate", value: "87%", hint: "replied leads" },
];

const bars = [40, 65, 48, 80, 55, 92, 70];

export function StatsCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-600 p-1 shadow-xl shadow-indigo-500/25 ${className}`}
    >
      <div className="relative h-full rounded-[1.85rem] bg-slate-950/10 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              This week
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Leads you almost lost
            </p>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            Live
          </span>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white/15 px-3 py-4 backdrop-blur-sm"
            >
              <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] font-medium leading-snug text-white/85 sm:text-xs">
                {s.label}
              </p>
              <p className="mt-0.5 text-[10px] text-white/55">{s.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-white/95 p-5 shadow-lg">
          <div className="flex items-end justify-between gap-1.5 sm:gap-2">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full max-w-[2rem] rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400"
                  style={{ height: `${h}px` }}
                />
                <span className="text-[10px] text-slate-400">
                  {"MTWTFSS"[i]}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            Missed-call volume · pause or cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
