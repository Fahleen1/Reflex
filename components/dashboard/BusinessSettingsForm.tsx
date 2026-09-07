"use client";

import { useState } from "react";
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
} from "@/lib/constants/onboarding";
import type { Business, BusinessHours, Market } from "@/lib/supabase/types";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";
import { buildWaMeLink } from "@/lib/utils/waMeLink";

function parseHours(raw: Business["business_hours"]): BusinessHours {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as unknown as BusinessHours;
  }
  return { ...DEFAULT_BUSINESS_HOURS };
}

interface BusinessSettingsFormProps {
  business: Business;
}

export function BusinessSettingsForm({ business }: BusinessSettingsFormProps) {
  const router = useRouter();
  const isPk = business.market === "pk";

  const [name, setName] = useState(business.name);
  const [industry, setIndustry] = useState(business.industry ?? "other");
  const [timezone, setTimezone] = useState(business.timezone);
  const [messageTemplate, setMessageTemplate] = useState(
    business.message_template,
  );
  const [voiceMessage, setVoiceMessage] = useState(
    business.missed_call_voice_message,
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    business.whatsapp_number
      ? formatPhoneDisplay(business.whatsapp_number)
      : "",
  );
  const [hours, setHours] = useState<BusinessHours>(
    parseHours(business.business_hours),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const timezoneOptions = isPk
    ? PK_TIMEZONES.map((t) => ({ value: t.value, label: t.label }))
    : US_TIMEZONES.map((t) => ({ value: t.value, label: t.label }));

  function updateHours(
    day: keyof BusinessHours,
    field: "open" | "close" | "closed",
    value: string | boolean,
  ) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload: Record<string, unknown> = {
      name: name.trim(),
      industry,
      timezone,
      business_hours: hours,
    };

    if (isPk) {
      payload.missed_call_voice_message = voiceMessage.trim();
      payload.whatsapp_number = whatsappNumber.trim();
    } else {
      payload.message_template = messageTemplate.trim();
    }

    const res = await fetch("/api/businesses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save settings");
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 2500);
  }

  const waMeLink = business.whatsapp_number
    ? buildWaMeLink(business.whatsapp_number)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title="Business profile">
        <div className="space-y-4">
          <Input
            label="Business name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Select
            label="Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            options={INDUSTRIES.map((i) => ({
              value: i.value,
              label: i.label,
            }))}
          />
          <Select
            label="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            options={timezoneOptions}
          />
          <p className="text-xs text-gray-500">
            Market:{" "}
            {(business.market as Market) === "pk"
              ? "Pakistan (Track B)"
              : "United States (Track A)"}{" "}
            — cannot be changed after onboarding.
          </p>
        </div>
      </Card>

      {!isPk && (
        <Card
          title="Missed-call SMS template"
          description="Sent automatically when a call is missed. Keep it transactional — avoid discounts or promotions."
        >
          <div className="space-y-2">
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={4}
              required
              className="block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <p className="text-xs text-gray-500">
              Available placeholder:{" "}
              <code className="rounded bg-gray-100 px-1">{"{business_name}"}</code>{" "}
              — replaced with your business name.
            </p>
          </div>
        </Card>
      )}

      {isPk && (
        <Card
          title="WhatsApp & voice announcement"
          description="Played to callers when you miss a call. Replies happen in your WhatsApp app."
        >
          <div className="space-y-4">
            <Input
              label="WhatsApp number"
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              hint="Pakistan number used for wa.me links"
              required
            />
            {waMeLink && (
              <p className="text-sm text-gray-600">
                Link:{" "}
                <a
                  href={waMeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-slate-950 hover:underline"
                >
                  {waMeLink}
                </a>
              </p>
            )}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Missed-call voice message
              </label>
              <textarea
                value={voiceMessage}
                onChange={(e) => setVoiceMessage(e.target.value)}
                rows={3}
                required
                className="block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </Card>
      )}

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
            const day = hours[key];
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
                      onChange={(e) => updateHours(key, "open", e.target.value)}
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
        </div>
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Settings saved.
        </p>
      )}

      <Button type="submit" loading={loading}>
        Save changes
      </Button>
    </form>
  );
}
