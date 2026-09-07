"use client";

import { useState } from "react";
import { ChatCard } from "@/components/marketing/ChatCard";

const faqs = [
  {
    q: "How does Reflex detect a missed call?",
    a: "Calls hit your Reflex number and forward to your phone. If there's no answer, our Twilio voice webhook triggers the follow-up for your market track.",
  },
  {
    q: "What’s the difference between US and Pakistan?",
    a: "US businesses get an automatic SMS plus an inbox for replies. Pakistan businesses play a short voice message that points callers to your WhatsApp number.",
  },
  {
    q: "Do customers need to opt in to SMS?",
    a: "US messaging follows the consent practices shown in onboarding and our privacy policy. Callers can reply STOP anytime. See /privacy for details.",
  },
  {
    q: "Can I cancel during the trial?",
    a: "Yes. Billing runs through Paddle. You can cancel anytime from Settings → Billing. No long-term lock-in.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Frequently asked questions
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Questions &amp; answers
          </h2>
          <p className="mt-4 text-slate-600">
            Quick answers about setup, markets, and billing. More detail lives
            in the product docs as you grow.
          </p>
        </div>

        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-2">
          <div className="relative flex items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-300 via-indigo-400 to-violet-500 p-8 sm:p-12">
            <ChatCard className="w-full max-w-sm" />
          </div>

          <div className="space-y-3">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={item.q}
                  className="rounded-[1.25rem] border border-slate-100 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-bold text-slate-950 sm:text-base">
                      {item.q}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lg leading-none text-white">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen ? (
                    <p className="border-t border-slate-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-slate-600">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
