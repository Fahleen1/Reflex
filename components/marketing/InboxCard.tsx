import { MockFrame } from "@/components/marketing/MockFrame";

const threads = [
  {
    name: "Alex M.",
    preview: "Can you come fix my AC this afternoon?",
    time: "2m",
    unread: true,
  },
  {
    name: "Sam Rivera",
    preview: "Thanks — Saturday at 10 works.",
    time: "1h",
    unread: false,
  },
  {
    name: "Jordan Lee",
    preview: "What's your rate for a roof quote?",
    time: "Yesterday",
    unread: true,
  },
  {
    name: "Priya N.",
    preview: "Got it — see you Thursday.",
    time: "Mon",
    unread: false,
  },
];

export function InboxCard({ className = "" }: { className?: string }) {
  return (
    <MockFrame
      className={className}
      title="Inbox"
      badge="2 new"
      footer="All replies in one place"
    >
      <ul className="min-h-[16rem] space-y-3 py-1">
        {threads.map((t, i) => (
          <li
            key={t.name}
            className={`flex items-start gap-3 rounded-2xl px-3 py-3.5 ${
              t.unread ? "bg-indigo-50" : "bg-slate-50"
            } ${i === 0 ? "animate-slide-in" : ""} ${
              i === 1 ? "animate-slide-in-delay" : ""
            } ${i >= 2 ? "animate-slide-in-delay-2" : ""}`}
          >
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                t.unread
                  ? "bg-gradient-to-br from-indigo-500 to-violet-500"
                  : "bg-slate-400"
              }`}
            >
              {t.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {t.name}
                </p>
                <span className="shrink-0 text-[11px] text-slate-400">
                  {t.time}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {t.preview}
              </p>
            </div>
            {t.unread ? (
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
            ) : null}
          </li>
        ))}
      </ul>
    </MockFrame>
  );
}
