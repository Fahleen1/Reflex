import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Reflex — Never lose a missed call lead",
    template: "%s · Reflex",
  },
  description:
    "When you miss a call, Reflex instantly texts the caller (US) or points them to WhatsApp (Pakistan). Keep local service leads warm.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    siteName: "Reflex",
    title: "Reflex — Never lose a missed call lead",
    description:
      "Missed-call text-back for local service businesses. 14-day free trial.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reflex — Never lose a missed call lead",
    description:
      "Missed-call text-back for local service businesses. 14-day free trial.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

function MarketingHeader() {
  return (
    <header className="relative z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-slate-950"
        >
          Reflex
        </Link>
        <nav className="flex items-center gap-1 sm:gap-5">
          <Link
            href="/"
            className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline"
          >
            Home
          </Link>
          <Link
            href="/pricing"
            className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline"
          >
            Pricing
          </Link>
          <Link
            href="/privacy"
            className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 md:inline"
          >
            Privacy
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="ml-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

function MarketingFooter() {
  return (
    <footer className="w-full rounded-t-[2.5rem] bg-gradient-to-br from-sky-200 via-indigo-200 to-violet-300 sm:rounded-t-[3rem]">
      <div className="mx-auto flex min-h-[22rem] w-full max-w-6xl flex-col justify-between px-8 py-12 sm:min-h-[26rem] sm:px-12 sm:py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-2xl font-bold text-slate-950">Reflex</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Missed-call follow-up for local service businesses—SMS in the US,
              WhatsApp pointers in Pakistan.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
              Pages
            </p>
            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-800">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:underline">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:underline">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:underline">
                  Sign in
                </Link>
              </li>
            </ul>
            <Link
              href="/signup"
              className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Get started
            </Link>
          </div>
        </div>
        <p className="mt-10 text-xs text-slate-600">
          © {new Date().getFullYear()} Reflex. Billing via Paddle. See{" "}
          <Link href="/privacy" className="underline">
            Privacy
          </Link>{" "}
          for SMS compliance.
        </p>
      </div>
    </footer>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-marketing)] text-slate-900 antialiased">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
