import Link from "next/link";
import { MeshGradient } from "@/components/marketing/Decor";

export function FinalCta() {
  return (
    <section className="relative px-4 pb-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] px-8 py-16 text-center sm:px-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-indigo-200 to-violet-300" />
        <MeshGradient className="opacity-50" />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Ready to stop losing missed-call leads?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-700">
            Start a 14-day free trial. Set up in minutes. Cancel anytime.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-slate-900/15 bg-white/70 px-7 py-3 text-sm font-semibold text-slate-950 backdrop-blur transition hover:bg-white"
            >
              See pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
