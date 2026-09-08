"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PaddleCheckoutButton } from "@/components/billing/PaddleCheckoutButton";
import {
  subscriptionStatusLabel,
} from "@/lib/paddle/access";
import type { Business } from "@/lib/supabase/types";

interface BillingStatusCardProps {
  business: Business;
  customerEmail?: string | null;
  checkoutSuccess?: boolean;
  blockedReason?: boolean;
}

export function BillingStatusCard({
  business,
  customerEmail,
  checkoutSuccess,
  blockedReason,
}: BillingStatusCardProps) {
  const router = useRouter();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSubscription = !!business.paddle_subscription_id;
  const status = business.subscription_status;

  async function openPortal() {
    setPortalLoading(true);
    setError(null);

    const res = await fetch("/api/paddle/portal", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not open billing portal");
      setPortalLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="space-y-6">
      {blockedReason && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Dashboard access requires an active Paddle subscription or trial.
          Complete checkout below to continue.
        </div>
      )}

      {checkoutSuccess && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          Checkout complete. If your status hasn&apos;t updated yet, wait a few
          seconds and refresh — Paddle webhooks sync subscription state.
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 cursor-pointer"
            onClick={() => router.refresh()}
          >
            Refresh
          </Button>
        </div>
      )}

      <Card title="Subscription" description="Paddle is the source of truth for trial and billing.">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Status</dt>
            <dd className="text-gray-900">{subscriptionStatusLabel(status)}</dd>
          </div>
          {business.trial_ends_at && status === "trialing" && (
            <div>
              <dt className="font-medium text-gray-500">Trial ends</dt>
              <dd className="text-gray-900">
                {new Date(business.trial_ends_at).toLocaleString()}
              </dd>
            </div>
          )}
          {business.paddle_subscription_id && (
            <div>
              <dt className="font-medium text-gray-500">Subscription ID</dt>
              <dd className="font-mono text-xs text-gray-600">
                {business.paddle_subscription_id}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 space-y-3">
          {!hasSubscription && (
            <>
              <p className="text-sm text-gray-600">
                Start your 14-day free trial via Paddle. You&apos;ll be charged
                automatically when the trial ends unless you cancel.
              </p>
              <PaddleCheckoutButton
                businessId={business.id}
                customerEmail={customerEmail}
                className="w-full sm:w-auto"
              />
            </>
          )}

          {hasSubscription && (
            <Button
              variant="secondary"
              loading={portalLoading}
              onClick={openPortal}
              className="cursor-pointer"
            >
              Manage billing in Paddle
            </Button>
          )}

          {(status === "canceled" ||
            status === "past_due" ||
            status === "paused") && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Your subscription is{" "}
              <strong>{subscriptionStatusLabel(status).toLowerCase()}</strong>.
              Dashboard access is paused until billing is restored.
              {!hasSubscription &&
                " Start a new trial or subscription below."}
              {hasSubscription &&
                " Use Manage billing to update payment or reactivate."}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </Card>
    </div>
  );
}
