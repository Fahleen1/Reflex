"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SubscriptionStatus } from "@/lib/supabase/types";

interface SubscriptionGuardProps {
  billingRequired: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  paddleSubscriptionId: string | null;
  children: React.ReactNode;
}

const ALLOWED_WHEN_BLOCKED = [
  "/settings/billing",
  "/settings/business",
  "/settings/number",
  "/settings/simulator",
  "/onboarding",
];

function canAccess(
  billingRequired: boolean,
  status: SubscriptionStatus | null,
  paddleSubscriptionId: string | null,
): boolean {
  if (!billingRequired) return true;
  if (!status) return true;
  if (status === "trialing" || status === "active") {
    return !!paddleSubscriptionId;
  }
  return false;
}

export function SubscriptionGuard({
  billingRequired,
  subscriptionStatus,
  paddleSubscriptionId,
  children,
}: SubscriptionGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const allowed = ALLOWED_WHEN_BLOCKED.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

    const access = canAccess(
      billingRequired,
      subscriptionStatus,
      paddleSubscriptionId,
    );

    if (!access && !allowed) {
      router.replace("/settings/billing?reason=subscription");
    }
  }, [
    billingRequired,
    subscriptionStatus,
    paddleSubscriptionId,
    pathname,
    router,
  ]);

  return <>{children}</>;
}
