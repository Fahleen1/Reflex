import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold text-blue-600">CallBack</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm">Start free trial</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Never lose a missed call lead again
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            When you miss a call, CallBack instantly texts the caller so the
            lead stays warm. Replies land in a simple inbox you can manage from
            anywhere.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">Start 14-day free trial</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="secondary" size="lg">
                View pricing
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50 py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
            {[
              {
                title: "Instant auto-text",
                body: "Missed call detected? Your customer gets a friendly text within seconds.",
              },
              {
                title: "Simple inbox",
                body: "All replies in one place. Respond from your phone or dashboard.",
              },
              {
                title: "Set up in minutes",
                body: "Get a dedicated number, forward calls, and start capturing leads today.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
