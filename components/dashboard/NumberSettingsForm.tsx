"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CALLER_ID_MODES } from "@/lib/constants/onboarding";
import type { Business, CallerIdMode } from "@/lib/supabase/types";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";

interface NumberSettingsFormProps {
  business: Business;
}

export function NumberSettingsForm({ business }: NumberSettingsFormProps) {
  const router = useRouter();
  const isPk = business.market === "pk";
  const isUs = !isPk;

  const [forwardingNumber, setForwardingNumber] = useState(
    business.forwarding_number
      ? formatPhoneDisplay(business.forwarding_number)
      : "",
  );
  const [callerIdMode, setCallerIdMode] = useState<CallerIdMode>(
    business.caller_id_mode,
  );
  const [needsCallerIdRetest, setNeedsCallerIdRetest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function saveForwarding(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/businesses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        forwarding_number: forwardingNumber.trim(),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to update forwarding number");
      setLoading(false);
      return;
    }

    setLoading(false);
    if (isUs && data.caller_id_reset) {
      setNeedsCallerIdRetest(true);
      setCallerIdMode("unknown");
      setSuccess(
        "Forwarding number updated. Please re-verify caller ID below — auto-text is paused until you confirm.",
      );
    } else {
      setSuccess("Forwarding number updated.");
    }
    router.refresh();
  }

  async function saveCallerIdMode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/businesses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caller_id_mode: callerIdMode }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save caller ID mode");
      setLoading(false);
      return;
    }

    setLoading(false);
    setNeedsCallerIdRetest(false);
    setSuccess("Caller ID mode saved.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card
        title="Your Reflex number"
        description="Advertise this number on Google, your website, and business cards."
      >
        <p className="text-2xl font-bold text-slate-800">
          {business.twilio_number
            ? formatPhoneDisplay(business.twilio_number)
            : "Not provisioned yet"}
        </p>
        {!business.twilio_number && (
          <p className="mt-2 text-sm text-amber-700">
            Add Twilio credentials and re-run onboarding, or assign a number in
            the Twilio console and update your business record.
          </p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Voice webhook:{" "}
          <code className="rounded bg-gray-100 px-1">
            /api/twilio/voice
          </code>
          {!isPk && (
            <>
              {" "}
              · SMS webhook:{" "}
              <code className="rounded bg-gray-100 px-1">/api/twilio/sms</code>
            </>
          )}
        </p>
      </Card>

      <Card
        title="Forwarding number"
        description="Calls to your Reflex number ring this phone. Disable voicemail on this line for reliable missed-call detection."
      >
        <form onSubmit={saveForwarding} className="space-y-4">
          <Input
            label="Forwarding phone number"
            type="tel"
            value={forwardingNumber}
            onChange={(e) => setForwardingNumber(e.target.value)}
            hint={
              isPk
                ? "Pakistan number (+92)"
                : "US number (+1). Changing this requires re-testing caller ID."
            }
            required
          />
          <Button type="submit" loading={loading}>
            Update forwarding number
          </Button>
        </form>
      </Card>

      {isUs && (
        <Card
          title="Caller ID verification"
          description={
            needsCallerIdRetest || business.caller_id_mode === "unknown"
              ? "Place a test call to your Reflex number, then select what caller ID appeared."
              : "Current mode based on your last test. Re-verify if you change carriers or forwarding."
          }
        >
          {(needsCallerIdRetest || business.caller_id_mode === "unknown") && (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Auto-text requires a confirmed caller ID mode. Call your Reflex
              number from another phone, don&apos;t answer, then select the
              result below.
            </div>
          )}

          <form onSubmit={saveCallerIdMode} className="space-y-3">
            {CALLER_ID_MODES.map((mode) => (
              <label
                key={mode.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  callerIdMode === mode.value
                    ? "border-slate-950 bg-slate-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="callerIdMode"
                  value={mode.value}
                  checked={callerIdMode === mode.value}
                  onChange={() => setCallerIdMode(mode.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">{mode.label}</p>
                  <p className="text-sm text-gray-500">{mode.description}</p>
                </div>
              </label>
            ))}
            <Button type="submit" loading={loading}>
              Save caller ID mode
            </Button>
          </form>
        </Card>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      )}
    </div>
  );
}
