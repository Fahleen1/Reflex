import Link from "next/link";
import { MeshGradient } from "@/components/marketing/Decor";

const perks = [
  "Unlimited missed-call auto-texts (US)",
  "WhatsApp voice-pointer flow (Pakistan)",
  "SMS inbox with reply (US)",
  "Dedicated business phone number",
  "Email alerts on new replies",
  "Call log & basic stats",
];

export function PricingTable() {
  return (
    <div className="relative mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-indigo-500/10">
      <div className="relative overflow-hidden px-8 pb-4 pt-8">
        <MeshGradient className="opacity-70" />
        <div className="relative">
          <p className="text-sm font-bold text-slate-950">Pro</p>
          <p className="mt-2 text-sm text-slate-600">
            Everything included for a single location. Start free, upgrade when
            ready.
          </p>
          <p className="mt-6">
            <span className="text-5xl font-bold tracking-tight text-slate-950">
              $49
            </span>
            <span className="text-slate-500">/mo</span>
          </p>
        </div>
      </div>
      <div className="space-y-3 border-t border-slate-100 px-8 py-6">
        {perks.map((p) => (
          <div key={p} className="flex items-start gap-3 text-sm text-slate-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[10px] text-white">
              ✓
            </span>
            {p}
          </div>
        ))}
        <Link
          href="/signup"
          className="mt-4 flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Start 14-day free trial
        </Link>
        <p className="text-center text-xs text-slate-500">
          Trial and billing via Paddle. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

export function PricingSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <MeshGradient />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Flexible options
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Start free, upgrade anytime
          </h2>
          <p className="mt-4 text-slate-600">
            One simple plan for local service businesses. 14-day free trial
            included.
          </p>
        </div>
        <div className="mt-12">
          <PricingTable />
        </div>
      </div>
    </section>
  );
}
