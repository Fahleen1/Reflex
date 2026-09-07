import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Reflex collects and uses business and messaging data, including SMS consent and opt-out.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: September 2026</p>

      <div className="mt-10 space-y-8 text-slate-600">
        <section>
          <h2 className="text-xl font-semibold text-slate-950">Overview</h2>
          <p className="mt-3">
            Reflex (&quot;we&quot;, &quot;us&quot;) provides missed-call follow-up
            for local service businesses. This policy describes what we collect
            and how we use it when you use our website and product.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950">
            SMS communications &amp; consent
          </h2>
          <p className="mt-3">
            For US businesses, Reflex enables automated text messages to callers
            who were unable to reach the business by phone. By using Reflex,
            business owners acknowledge that callers may receive an automated
            text after a missed call, consistent with the consent and messaging
            practices disclosed during onboarding.
          </p>
          <p className="mt-3">
            Message frequency varies based on missed calls. Message and data
            rates may apply. Recipients can reply{" "}
            <strong className="text-slate-950">STOP</strong>,{" "}
            <strong className="text-slate-950">UNSUBSCRIBE</strong>, or{" "}
            <strong className="text-slate-950">CANCEL</strong> at any time to
            opt out of future automated messages. Reply{" "}
            <strong className="text-slate-950">HELP</strong> for support
            information. Opt-outs are honored promptly for that business&apos;s
            Reflex number.
          </p>
          <p className="mt-3">
            Pakistan-track businesses use a voice message directing callers to
            WhatsApp; Reflex does not send SMS on that track.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950">
            Data we collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Account information (name, email, business profile, phone numbers)
            </li>
            <li>
              Call metadata (caller numbers, timestamps, duration, status, skip
              reasons)
            </li>
            <li>SMS content and delivery status (US track)</li>
            <li>
              Billing identifiers from our payment provider (Paddle); we do not
              store full card numbers
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950">
            How we use data
          </h2>
          <p className="mt-3">
            We use data solely to operate the missed-call service: sending
            automated follow-ups, displaying conversations and call logs,
            enforcing opt-outs and rate limits, sending owner email alerts, and
            managing subscriptions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950">
            Processors &amp; retention
          </h2>
          <p className="mt-3">
            We rely on infrastructure providers such as Supabase (database and
            auth), Twilio (voice and SMS), Paddle (billing), and Resend (email
            alerts). Data is retained while your account is active and as needed
            for legal, security, and operational purposes after cancellation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950">Contact</h2>
          <p className="mt-3">
            For privacy questions, contact{" "}
            <a
              href="mailto:privacy@reflex.app"
              className="font-medium text-indigo-600 hover:underline"
            >
              privacy@reflex.app
            </a>
            .
          </p>
          <p className="mt-6">
            <Link
              href="/"
              className="font-medium text-indigo-600 hover:underline"
            >
              ← Back to home
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
