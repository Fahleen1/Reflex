import Link from "next/link";
import { ChatCard } from "@/components/marketing/ChatCard";
import { MeshGradient } from "@/components/marketing/Decor";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-14">
      <MeshGradient />

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Missed calls, captured
        </p>
        <h1 className="animate-fade-up-delay mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
          Never lose a missed call lead again
        </h1>
        <p className="animate-fade-up-delay mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          When you can&apos;t pick up, Reflex instantly texts the caller—or
          points them to WhatsApp—so the conversation stays warm.
        </p>
        <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start free trial
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-slate-300 bg-white/70 px-7 py-3 text-sm font-semibold text-slate-900 backdrop-blur transition hover:bg-white"
          >
            View pricing
          </Link>
        </div>
      </div>

      <div className="relative mx-auto mt-14 max-w-md px-4 animate-float">
        <ChatCard />
      </div>
    </section>
  );
}
