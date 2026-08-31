"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { buildWaMeLink } from "@/lib/utils/waMeLink";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";

interface WhatsAppInfoCardProps {
  whatsappNumber: string;
  voiceMessage?: string;
  twilioNumber?: string | null;
  showGooglePrompt?: boolean;
}

export function WhatsAppInfoCard({
  whatsappNumber,
  voiceMessage,
  twilioNumber,
  showGooglePrompt = true,
}: WhatsAppInfoCardProps) {
  const waMeLink = buildWaMeLink(whatsappNumber);
  const [copied, setCopied] = useState<"link" | "number" | null>(null);

  async function handleCopy(text: string, kind: "link" | "number") {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <Card
      title="WhatsApp click-to-chat"
      description="Customers message you directly on WhatsApp — replies happen in your WhatsApp app, not this dashboard."
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm font-medium text-green-900">Your WhatsApp link</p>
          <a
            href={waMeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-all text-lg font-semibold text-green-700 hover:underline"
          >
            {waMeLink}
          </a>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => handleCopy(waMeLink, "link")}
          >
            {copied === "link" ? "Copied!" : "Copy link"}
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-900">WhatsApp number: </span>
            {formatPhoneDisplay(whatsappNumber)}
          </p>
          {twilioNumber && (
            <p className="mt-1">
              <span className="font-medium text-gray-900">Call detection number: </span>
              {formatPhoneDisplay(twilioNumber)}
            </p>
          )}
        </div>

        {voiceMessage && (
          <div className="rounded-lg border border-gray-200 p-4 text-sm">
            <p className="font-medium text-gray-900">Missed-call voice message</p>
            <p className="mt-1 text-gray-600">&ldquo;{voiceMessage}&rdquo;</p>
            <p className="mt-2 text-xs text-gray-500">
              Played to callers when you don&apos;t answer (Module 3).
            </p>
          </div>
        )}

        {showGooglePrompt && (
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-medium">Add this to your Google Business Profile</p>
            <p className="mt-1">
              Paste your WhatsApp link in your Google listing, website, and signage
              so missed callers know how to reach you.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
