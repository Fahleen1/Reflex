import Link from "next/link";
import { ChatCard } from "@/components/marketing/ChatCard";

const steps = [
  {
    n: "01",
    title: "Connect your number",
    body: "Get a Reflex number, set call forwarding (US) or WhatsApp (Pakistan), and you're live.",
  },
  {
    n: "02",
    title: "Miss a call? We follow up",
    body: "Unanswered calls trigger an auto-SMS or a short voice message pointing to WhatsApp.",
  },
  {
    n: "03",
    title: "Reply when you're free",
    body: "Handle the conversation in your inbox or WhatsApp—without losing the lead.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Built to be simple
          </h2>
          <p className="mt-4 text-slate-600">
            Capture missed-call leads in a few steps—no complex setup, no
            learning curve.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-sky-300 via-indigo-400 to-violet-500 opacity-90" />
            <div className="relative p-6 sm:p-10">
              <ChatCard className="mx-auto max-w-sm" />
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step) => (
              <article
                key={step.n}
                className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{step.body}</p>
                  </div>
                </div>
              </article>
            ))}
            <Link
              href="/pricing"
              className="mt-2 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
