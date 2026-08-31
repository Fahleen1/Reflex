"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import {
  INDUSTRIES,
  US_TIMEZONES,
  PK_TIMEZONES,
  DAYS_OF_WEEK,
  DEFAULT_BUSINESS_HOURS,
  CALLER_ID_MODES,
  CONSENT_NOTICE,
  MARKETS,
  DEFAULT_VOICE_MESSAGE,
} from "@/lib/constants/onboarding";
import type { BusinessHours, CallerIdMode, Market } from "@/lib/supabase/types";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";
import { buildWaMeLink } from "@/lib/utils/waMeLink";

type Step = 1 | 2 | 3 | 4 | 5;

interface OnboardingWizardProps {
  initialStep?: Step;
  initialTwilioNumber?: string | null;
  initialMarket?: Market;
}

interface OnboardingData {
  name: string;
  industry: string;
  market: Market;
  forwardingNumber: string;
  whatsappNumber: string;
  voiceMessage: string;
  timezone: string;
  businessHours: BusinessHours;
  consentAccepted: boolean;
  callerIdMode: CallerIdMode;
  twilioNumber: string | null;
  waMeLink: string | null;
}

const US_STEPS = [
  "Business info",
  "Phone setup",
  "Business hours",
  "Test caller ID",
  "Done",
];

const PK_STEPS = ["Business info", "WhatsApp setup", "Business hours", "Done"];

export function OnboardingWizard({
  initialStep = 1,
  initialTwilioNumber = null,
  initialMarket = "us",
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    industry: "other",
    market: initialMarket,
    forwardingNumber: "",
    whatsappNumber: "",
    voiceMessage: DEFAULT_VOICE_MESSAGE,
    timezone: initialMarket === "pk" ? "Asia/Karachi" : "America/New_York",
    businessHours: { ...DEFAULT_BUSINESS_HOURS },
    consentAccepted: false,
    callerIdMode: "unknown",
    twilioNumber: initialTwilioNumber,
    waMeLink: null,
  });

  const isPk = data.market === "pk";
  const stepLabels = isPk ? PK_STEPS : US_STEPS;

  const displayStepIndex = useMemo(() => {
    if (isPk) {
      if (step >= 5) return 4;
      return step;
    }
    return step;
  }, [isPk, step]);

  function updateField<K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K],
  ) {
    setData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "market") {
        const market = value as Market;
        next.timezone =
          market === "pk" ? "Asia/Karachi" : "America/New_York";
        next.consentAccepted = false;
      }
      return next;
    });
  }

  function updateHours(
    day: keyof BusinessHours,
    field: "open" | "close" | "closed",
    value: string | boolean,
  ) {
    setData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  }

  async function handleSaveBusiness() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        industry: data.industry,
        market: data.market,
        forwarding_number: data.forwardingNumber,
        whatsapp_number: isPk ? data.whatsappNumber : undefined,
        missed_call_voice_message: isPk ? data.voiceMessage : undefined,
        timezone: data.timezone,
        business_hours: data.businessHours,
        consent_accepted: isPk ? undefined : data.consentAccepted,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error ?? "Failed to save business profile");
      setLoading(false);
      return;
    }

    updateField("twilioNumber", result.twilio_number);
    if (result.wa_me_link) updateField("waMeLink", result.wa_me_link);
    setLoading(false);
    setStep(isPk ? 5 : 4);
  }

  async function handleSaveCallerIdMode() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/businesses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caller_id_mode: data.callerIdMode }),
    });

    if (!res.ok) {
      const result = await res.json();
      setError(result.error ?? "Failed to save caller ID mode");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep(5);
  }

  const timezoneOptions = isPk
    ? PK_TIMEZONES.map((t) => ({ value: t.value, label: t.label }))
    : US_TIMEZONES.map((t) => ({ value: t.value, label: t.label }));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const active = displayStepIndex === stepNum;
            const done = displayStepIndex > stepNum;
            return (
              <div key={label} className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    done
                      ? "bg-blue-600 text-white"
                      : active
                        ? "border-2 border-blue-600 text-blue-600"
                        : "border-2 border-gray-200 text-gray-400"
                  }`}
                >
                  {done ? "✓" : stepNum}
                </div>
                <span
                  className={`mt-1 hidden text-xs sm:block ${active ? "font-medium text-blue-600" : "text-gray-400"}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <Card title="Tell us about your business">
          <div className="space-y-4">
            <Input
              label="Business name"
              value={data.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={isPk ? "Ali's Plumbing" : "Joe's Plumbing"}
              required
            />
            <Select
              label="Market"
              value={data.market}
              onChange={(e) => updateField("market", e.target.value as Market)}
              options={MARKETS.map((m) => ({
                value: m.value,
                label: m.label,
              }))}
            />
            <p className="text-xs text-gray-500">
              {MARKETS.find((m) => m.value === data.market)?.description}
            </p>
            <Select
              label="Industry"
              value={data.industry}
              onChange={(e) => updateField("industry", e.target.value)}
              options={INDUSTRIES.map((i) => ({
                value: i.value,
                label: i.label,
              }))}
            />
            <Select
              label="Timezone"
              value={data.timezone}
              onChange={(e) => updateField("timezone", e.target.value)}
              options={timezoneOptions}
            />
            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!data.name.trim()}
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && !isPk && (
        <Card
          title="Phone number setup"
          description="We'll provision a dedicated number for your business. Calls to this number will forward to your real phone."
        >
          <div className="space-y-4">
            <Input
              label="Your real phone number (forwarding target)"
              type="tel"
              value={data.forwardingNumber}
              onChange={(e) => updateField("forwardingNumber", e.target.value)}
              placeholder="(555) 123-4567"
              hint="Calls to your CallBack number will ring this phone. US numbers (+1)."
              required
            />
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Important: disable voicemail</p>
              <p className="mt-1">
                If your forwarding line has voicemail, missed calls may be
                treated as &quot;answered&quot; and no auto-text will be sent.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={data.consentAccepted}
                  onChange={(e) =>
                    updateField("consentAccepted", e.target.checked)
                  }
                  className="mt-1 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{CONSENT_NOTICE}</span>
              </label>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep(3)}
                disabled={!data.forwardingNumber.trim() || !data.consentAccepted}
              >
                Continue
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 2 && isPk && (
        <Card
          title="WhatsApp & phone setup"
          description="Missed calls will play a voice message pointing callers to your WhatsApp. No SMS is sent."
        >
          <div className="space-y-4">
            <Input
              label="Your business phone (forwarding target)"
              type="tel"
              value={data.forwardingNumber}
              onChange={(e) => updateField("forwardingNumber", e.target.value)}
              placeholder="0300 1234567"
              hint="Calls to your CallBack number will ring this phone."
              required
            />
            <Input
              label="WhatsApp number"
              type="tel"
              value={data.whatsappNumber}
              onChange={(e) => updateField("whatsappNumber", e.target.value)}
              placeholder="0300 1234567"
              hint="Your WhatsApp Business or personal number. Used for wa.me links."
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Missed-call voice message
              </label>
              <textarea
                value={data.voiceMessage}
                onChange={(e) => updateField("voiceMessage", e.target.value)}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Read aloud to callers when you don&apos;t answer. Mention WhatsApp.
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Disable voicemail on your forwarding line</p>
              <p className="mt-1">
                Voicemail may count as &quot;answered&quot;, preventing the voice
                announcement from playing.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep(3)}
                disabled={
                  !data.forwardingNumber.trim() || !data.whatsappNumber.trim()
                }
              >
                Continue
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card
          title="Business hours"
          description={
            isPk
              ? "Stored for future use. Voice announcements currently play 24/7."
              : "Stored for future use. Auto-texts currently send 24/7 regardless of hours."
          }
        >
          <div className="space-y-3">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const day = data.businessHours[key];
              return (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <label className="flex w-28 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!day.closed}
                      onChange={(e) =>
                        updateHours(key, "closed", !e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="font-medium">{label}</span>
                  </label>
                  {!day.closed ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={day.open}
                        onChange={(e) =>
                          updateHours(key, "open", e.target.value)
                        }
                        className="rounded border border-gray-300 px-2 py-1"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="time"
                        value={day.close}
                        onChange={(e) =>
                          updateHours(key, "close", e.target.value)
                        }
                        className="rounded border border-gray-300 px-2 py-1"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400">Closed</span>
                  )}
                </div>
              );
            })}
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                className="flex-1"
                loading={loading}
                onClick={handleSaveBusiness}
              >
                {isPk ? "Save & finish setup" : "Save & get my number"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 4 && !isPk && (
        <Card
          title="Test your caller ID"
          description="Place a test call to verify what caller ID we receive. This determines whether auto-text can identify callers."
        >
          <div className="space-y-4">
            {data.twilioNumber ? (
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900">
                  Your CallBack number
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {formatPhoneDisplay(data.twilioNumber)}
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                Twilio is not configured — no number was provisioned. Add Twilio
                credentials to your environment and re-run onboarding.
              </div>
            )}
            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-medium">How to test:</p>
              <ol className="list-inside list-decimal space-y-1 text-gray-600">
                <li>From a different phone, call your CallBack number above.</li>
                <li>Let it ring — don&apos;t answer on the forwarded line.</li>
                <li>Check what caller ID appeared in the Twilio webhook.</li>
                <li>Select the result below.</li>
              </ol>
            </div>
            <div className="space-y-2">
              {CALLER_ID_MODES.map((mode) => (
                <label
                  key={mode.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    data.callerIdMode === mode.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="callerIdMode"
                    value={mode.value}
                    checked={data.callerIdMode === mode.value}
                    onChange={() => updateField("callerIdMode", mode.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{mode.label}</p>
                    <p className="text-sm text-gray-500">{mode.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                className="flex-1"
                loading={loading}
                onClick={handleSaveCallerIdMode}
              >
                Confirm &amp; finish
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 5 && (
        <Card title="You're all set!">
          <div className="space-y-4">
            {isPk && data.waMeLink && (
              <>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-900">
                    Your WhatsApp click-to-chat link
                  </p>
                  <a
                    href={data.waMeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block break-all text-lg font-bold text-green-700 hover:underline"
                  >
                    {data.waMeLink}
                  </a>
                  {data.whatsappNumber && (
                    <p className="mt-2 text-sm text-green-800">
                      WhatsApp: {formatPhoneDisplay(data.whatsappNumber)}
                    </p>
                  )}
                </div>
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                  <p className="font-medium">Add this to your Google Business Profile</p>
                  <p className="mt-1">
                    Paste your WhatsApp link on Google, your website, and signage so
                    missed callers know how to reach you.
                  </p>
                </div>
              </>
            )}

            {!isPk && data.twilioNumber && (
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm font-medium text-green-900">
                  Your business number
                </p>
                <p className="mt-1 text-2xl font-bold text-green-700">
                  {formatPhoneDisplay(data.twilioNumber)}
                </p>
              </div>
            )}

            {isPk && data.twilioNumber && (
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <p className="font-medium text-gray-900">Call detection number</p>
                <p className="mt-1 text-gray-700">
                  {formatPhoneDisplay(data.twilioNumber)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Forward calls here for missed-call detection. Voice announcement
                  plays on no-answer (Module 3).
                </p>
              </div>
            )}

            {!isPk && (
              <>
                <div className="space-y-3 text-sm text-gray-700">
                  <p className="font-medium">Setup instructions:</p>
                  <ul className="list-inside list-disc space-y-2 text-gray-600">
                    <li>
                      <strong>Recommended:</strong> Use your CallBack number on
                      Google, your website, and business cards.
                    </li>
                    <li>
                      When a call is missed, CallBack automatically texts the
                      caller (Module 3).
                    </li>
                  </ul>
                </div>
                {data.callerIdMode !== "passthrough" && (
                  <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">Caller ID limitation</p>
                    <p className="mt-1">
                      Auto-text requires the real caller&apos;s number. Consider
                      advertising your CallBack number directly.
                    </p>
                  </div>
                )}
              </>
            )}

            {isPk && data.whatsappNumber && !data.waMeLink && (
              <p className="text-sm text-gray-600">
                WhatsApp link: {buildWaMeLink(data.whatsappNumber)}
              </p>
            )}

            <Button
              className="w-full"
              onClick={() => {
                router.push("/dashboard");
                router.refresh();
              }}
            >
              Go to dashboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
