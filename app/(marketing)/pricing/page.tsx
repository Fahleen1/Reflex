import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-blue-600">
            CallBack
          </Link>
          <Link href="/signup">
            <Button size="sm">Start free trial</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Simple pricing</h1>
          <p className="mt-2 text-gray-600">
            One plan. Everything included. 14-day free trial.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium text-blue-600">Pro</p>
            <p className="mt-2">
              <span className="text-4xl font-bold text-gray-900">$49</span>
              <span className="text-gray-500">/month</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li>Unlimited missed-call auto-texts</li>
              <li>SMS inbox with reply</li>
              <li>Dedicated business phone number</li>
              <li>Email alerts on new replies</li>
              <li>Call log &amp; basic stats</li>
            </ul>
            <Link href="/signup" className="mt-8 block">
              <Button className="w-full" size="lg">
                Start 14-day free trial
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs text-gray-500">
              No credit card required during trial. Cancel anytime.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
