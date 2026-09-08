"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=/onboarding`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirect=/onboarding`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-1/4 top-0 h-[60%] w-[60%] rounded-full bg-sky-300/30 blur-3xl"
        />
        <div className="relative w-full max-w-md rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-8 text-center shadow-[0_20px_50px_-24px_rgba(79,70,229,0.35)]">
          <h2 className="text-lg font-semibold text-slate-950">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            We sent a confirmation link to <strong>{email}</strong>. Click it
            to activate your account, then you&apos;ll be guided through setup.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm font-semibold text-slate-950 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-0 h-[60%] w-[60%] rounded-full bg-sky-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[50%] w-[50%] rounded-full bg-violet-400/25 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="md" href="/" priority />
          <p className="mt-4 text-slate-600">Start your 14-day free trial</p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_50px_-24px_rgba(79,70,229,0.35)] backdrop-blur">
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-2xl border-slate-200 px-4 py-2.5 focus:border-indigo-400 focus:ring-indigo-400"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              hint="At least 8 characters"
              autoComplete="new-password"
              className="rounded-2xl border-slate-200 px-4 py-2.5 focus:border-indigo-400 focus:ring-indigo-400"
            />

            {error && (
              <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer !rounded-full !bg-slate-950 py-3 hover:!bg-slate-800 focus:!ring-slate-900 disabled:!bg-slate-400"
              loading={loading}
            >
              Create account
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">or</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full cursor-pointer !rounded-full border-slate-300 bg-white py-3 text-slate-950 hover:bg-slate-50 focus:!ring-slate-400"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-slate-950 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center font-[family-name:var(--font-marketing)]">
          Loading…
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
