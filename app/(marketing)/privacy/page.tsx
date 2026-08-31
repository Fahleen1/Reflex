import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-blue-600">
            CallBack
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 prose prose-gray">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: August 2026</p>

        <h2>SMS Communications</h2>
        <p>
          CallBack enables businesses to send automated text messages to callers
          who were unable to reach the business by phone. By using CallBack,
          business owners agree that their customers may receive an automated
          text message after a missed call.
        </p>
        <p>
          Customers can reply <strong>STOP</strong>, <strong>UNSUBSCRIBE</strong>,
          or <strong>CANCEL</strong> at any time to opt out of future automated
          messages. Reply <strong>HELP</strong> for support information.
        </p>

        <h2>Data We Collect</h2>
        <ul>
          <li>Business account information (name, email, phone numbers)</li>
          <li>Call logs (caller numbers, timestamps, call status)</li>
          <li>SMS message content and delivery status</li>
        </ul>

        <h2>How We Use Data</h2>
        <p>
          Data is used solely to provide the missed-call text-back service,
          including sending automated texts, displaying conversation threads,
          and generating call statistics for the business owner.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy questions, contact us at{" "}
          <a href="mailto:privacy@callback.app">privacy@callback.app</a>.
        </p>
      </main>
    </div>
  );
}
