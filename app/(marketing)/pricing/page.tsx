import type { Metadata } from "next";
import { PricingTable } from "@/components/marketing/PricingTable";
import { MeshGradient } from "@/components/marketing/Decor";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Reflex Pro — $49/month. Unlimited missed-call follow-up for US and Pakistan. 14-day free trial.",
};

export default function PricingPage() {
  return (
    <main className="relative overflow-hidden py-16 sm:py-24">
      <MeshGradient />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Flexible options
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Start free, upgrade anytime
          </h1>
          <p className="mt-4 text-slate-600">
            One plan. Everything included. 14-day free trial via Paddle.
          </p>
        </div>
        <div className="mt-12">
          <PricingTable />
        </div>
      </div>
    </main>
  );
}
