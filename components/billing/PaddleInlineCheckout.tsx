"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckoutEventNames,
  initializePaddle,
  type CheckoutEventError,
  type CheckoutEventsData,
  type Paddle,
} from "@paddle/paddle-js";

interface PaddleInlineCheckoutProps {
  businessId: string;
  customerEmail?: string | null;
}

const FRAME_TARGET = "paddle-checkout-container";

let inlinePaddlePromise: Promise<Paddle | undefined> | null = null;

function formatCheckoutError(error: CheckoutEventError): string {
  if (error.code === "transaction_default_checkout_url_not_set") {
    const checkoutSettingsUrl =
      process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
        ? "https://vendors.paddle.com/checkout-settings"
        : "https://sandbox-vendors.paddle.com/checkout-settings";

    return `Set a default payment link in Paddle (Checkout → Checkout settings), then try again. ${checkoutSettingsUrl}`;
  }

  return error.detail || "Checkout failed. Please try again.";
}

function loadInlinePaddle(
  onLoaded: (data: CheckoutEventsData) => void,
  onError: (error: CheckoutEventError) => void,
): Promise<Paddle | undefined> {
  if (!inlinePaddlePromise) {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) {
      return Promise.resolve(undefined);
    }

    inlinePaddlePromise = initializePaddle({
      token,
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
          ? "production"
          : "sandbox",
      checkout: {
        settings: {
          displayMode: "inline",
          frameTarget: FRAME_TARGET,
          frameInitialHeight: "720",
          frameStyle:
            "width: 100%; min-width: 312px; background-color: transparent; border: none;",
          theme: "light",
          allowLogout: false,
        },
      },
      eventCallback: (event) => {
        if (event.name === CheckoutEventNames.CHECKOUT_LOADED && event.data) {
          onLoaded(event.data);
        }
        if (event.name === CheckoutEventNames.CHECKOUT_ERROR) {
          onError(event as CheckoutEventError);
        }
      },
    });
  }

  return inlinePaddlePromise;
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

function CheckoutSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      <p className="text-sm">Preparing secure checkout…</p>
    </div>
  );
}

export function PaddleInlineCheckout({
  businessId,
  customerEmail,
}: PaddleInlineCheckoutProps) {
  const openedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutEventsData | null>(
    null,
  );

  const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
  const configured = !!(
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && priceId
  );

  useEffect(() => {
    if (!configured || !priceId || openedRef.current) return;

    openedRef.current = true;
    const appUrl = window.location.origin;

    void (async () => {
      try {
        const paddle = await loadInlinePaddle(setCheckoutData, (checkoutError) => {
          console.error(checkoutError);
          setError(formatCheckoutError(checkoutError));
          setLoading(false);
        });

        if (!paddle) {
          setError("Failed to load Paddle.js");
          setLoading(false);
          return;
        }

        paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          customData: { business_id: businessId },
          ...(customerEmail ? { customer: { email: customerEmail } } : {}),
          settings: {
            successUrl: `${appUrl}/settings/billing?checkout=success`,
            allowLogout: false,
          },
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Checkout failed");
        setLoading(false);
      }
    })();
  }, [businessId, configured, customerEmail, priceId]);

  useEffect(() => {
    if (checkoutData) {
      setLoading(false);
    }
  }, [checkoutData]);

  if (!configured) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-white p-6">
        <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Paddle is not configured. Add checkout env vars to continue.
        </div>
      </div>
    );
  }

  const primaryItem = checkoutData?.items[0];
  const totals = checkoutData?.totals;
  const planName = primaryItem?.product.name ?? "Monthly Pro";
  const dueToday =
    totals && checkoutData
      ? formatMoney(totals.total, checkoutData.currency_code)
      : null;

  return (
    <div className="fixed inset-0 z-100 flex bg-white">
      <aside className="hidden w-[42%] flex-col justify-between bg-slate-950 px-10 py-12 text-white lg:flex">
        <div className="space-y-10">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white"
          >
            Reflex
          </Link>

          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-400">Reflex Pro</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              14-day free trial
            </h1>
            <p className="max-w-sm text-lg text-slate-300">
              Missed-call follow-up for your business. Cancel anytime before the
              trial ends.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-slate-300">
            <li>· Voice + WhatsApp missed-call follow-up</li>
            <li>· Call log and dashboard</li>
            <li>· No charge until trial ends</li>
          </ul>

          {dueToday && (
            <p className="text-sm text-slate-400">
              {planName} · {dueToday} due today
            </p>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Secure checkout powered by Paddle
        </p>
      </aside>

      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 lg:px-8">
          <Link
            href="/settings/billing"
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            ← Back
          </Link>
          <span className="text-sm font-semibold text-slate-950 lg:hidden">
            Reflex Pro trial
          </span>
          <span className="hidden w-12 lg:block" aria-hidden />
        </header>

        <div className="flex flex-1 flex-col items-center px-5 py-6 lg:px-12 lg:py-10">
          <div className="mb-6 w-full max-w-md space-y-2 text-center lg:hidden">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Start your free trial
            </h1>
            <p className="text-sm text-slate-600">
              14 days free, then billed monthly. Cancel anytime.
            </p>
          </div>

          {error && (
            <div className="mb-4 w-full max-w-md rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="relative w-full max-w-md flex-1">
            {loading && !error && (
              <div className="absolute inset-0 z-10 flex items-start justify-center bg-white">
                <CheckoutSpinner />
              </div>
            )}
            <div className={`${FRAME_TARGET} min-h-112 w-full`} />
          </div>
        </div>
      </section>
    </div>
  );
}
