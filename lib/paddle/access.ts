import type { SubscriptionStatus } from "@/lib/supabase/types";
import { isPaddleConfigured } from "@/lib/paddle/client";

/**
 * Whether the business can use the dashboard based on subscription_status.
 * When Paddle env vars are missing (local/dev), access is always allowed.
 * When Paddle is configured, require an active/trialing subscription with a
 * paddle_subscription_id (checkout completed).
 */
export function hasDashboardAccess(business: {
  subscription_status: SubscriptionStatus;
  paddle_subscription_id: string | null;
}): boolean {
  if (!isPaddleConfigured()) {
    return true;
  }

  switch (business.subscription_status) {
    case "trialing":
    case "active":
      return !!business.paddle_subscription_id;
    case "past_due":
    case "canceled":
    case "paused":
      return false;
    default: {
      const _exhaustive: never = business.subscription_status;
      return _exhaustive;
    }
  }
}

export function mapPaddleSubscriptionStatus(
  paddleStatus: string,
): SubscriptionStatus {
  switch (paddleStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "cancelled":
      return "canceled";
    case "paused":
      return "paused";
    default:
      return "paused";
  }
}

export function subscriptionStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "trialing":
      return "Free trial";
    case "active":
      return "Active";
    case "past_due":
      return "Past due";
    case "canceled":
      return "Canceled";
    case "paused":
      return "Paused";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
