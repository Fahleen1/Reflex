"use client";

import { useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { Button } from "@/components/ui/Button";

interface PaddleCheckoutButtonProps {
  businessId: string;
  customerEmail?: string | null;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onCheckoutCompleted?: () => void;
}

let paddlePromise: Promise<Paddle | undefined> | null = null;

function loadPaddle(): Promise<Paddle | undefined> {
  if (!paddlePromise) {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) {
      return Promise.resolve(undefined);
    }
    paddlePromise = initializePaddle({
      token,
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
          ? "production"
          : "sandbox",
    });
  }
  return paddlePromise;
}

export function PaddleCheckoutButton({
  businessId,
  customerEmail,
  label = "Start 14-day free trial",
  size = "md",
  className = "",
  onCheckoutCompleted,
}: PaddleCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
  const configured = !!(
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN &&
    priceId
  );

  async function handleCheckout() {
    if (!configured || !priceId) {
      setError("Paddle is not configured. Add checkout env vars to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paddle = await loadPaddle();
      if (!paddle) {
        setError("Failed to load Paddle.js");
        setLoading(false);
        return;
      }

      const appUrl = window.location.origin;

      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { business_id: businessId },
        ...(customerEmail
          ? { customer: { email: customerEmail } }
          : {}),
        settings: {
          successUrl: `${appUrl}/settings/billing?checkout=success`,
          allowLogout: false,
        },
      });

      onCheckoutCompleted?.();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <div className="space-y-2">
        <Button size={size} className={className} disabled>
          {label}
        </Button>
        <p className="text-xs text-amber-700">
          Billing is not configured yet. Set{" "}
          <code className="rounded bg-amber-100 px-1">
            NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
          </code>{" "}
          and{" "}
          <code className="rounded bg-amber-100 px-1">
            NEXT_PUBLIC_PADDLE_PRICE_ID
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        size={size}
        className={className}
        loading={loading}
        onClick={handleCheckout}
      >
        {label}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
