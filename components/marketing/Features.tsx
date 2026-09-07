import Link from "next/link";
import { WaveBg } from "@/components/marketing/Decor";

const features = [
  {
    title: "Instant auto-text",
    body: "Missed call detected? Callers get a friendly SMS within seconds on the US track.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    ),
  },
  {
    title: "WhatsApp pointer",
    body: "In Pakistan, a short voice message sends callers straight to your WhatsApp.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    ),
  },
  {
    title: "Simple inbox",
    body: "Replies land in one place. Respond from your phone or the Reflex dashboard.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    ),
  },
  {
    title: "Call log & stats",
    body: "See missed calls, skip reasons, and response rates without opening a spreadsheet.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
  },
  {
    title: "Setup in minutes",
    body: "Get a number, set forwarding or WhatsApp, and start capturing leads the same day.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
  },
];

export function Features() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <WaveBg className="text-slate-300/40" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Complete control
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Everything you need to catch every lead
          </h2>
          <p className="mt-4 text-slate-600">
            Built for local service businesses—plumbers, HVAC, salons, and
            more—across the US and Pakistan.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="rounded-[1.75rem] border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  {f.icon}
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-950">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {f.body}
              </p>
            </article>
          ))}

          <article className="flex flex-col justify-between rounded-[1.75rem] bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-600 p-7 text-white shadow-lg shadow-indigo-500/25">
            <div>
              <h3 className="text-lg font-bold">Start capturing leads</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                14-day free trial. No long-term contract. Cancel anytime from
                billing.
              </p>
            </div>
            <Link
              href="/signup"
              className="mt-8 inline-flex w-fit rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Get started
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
