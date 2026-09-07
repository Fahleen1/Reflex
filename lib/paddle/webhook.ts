import { createServiceClient } from "@/lib/supabase/service";
import { mapPaddleSubscriptionStatus } from "@/lib/paddle/access";
import type { Json, SubscriptionStatus } from "@/lib/supabase/types";

export interface PaddleWebhookEvent {
  event_id: string;
  event_type: string;
  data: {
    id: string;
    status?: string;
    customer_id?: string;
    custom_data?: Record<string, unknown> | null;
    current_billing_period?: {
      ends_at?: string | null;
      starts_at?: string | null;
    } | null;
    next_billed_at?: string | null;
  };
}

function extractBusinessId(
  customData: Record<string, unknown> | null | undefined,
): string | null {
  if (!customData) return null;
  const id = customData.business_id ?? customData.businessId;
  return typeof id === "string" && id.length > 0 ? id : null;
}

async function resolveBusinessId(
  event: PaddleWebhookEvent,
): Promise<string | null> {
  const fromCustom = extractBusinessId(event.data.custom_data ?? undefined);
  if (fromCustom) return fromCustom;

  const supabase = createServiceClient();
  const subscriptionId = event.data.id;

  const { data: bySub } = await supabase
    .from("businesses")
    .select("id")
    .eq("paddle_subscription_id", subscriptionId)
    .maybeSingle();

  if (bySub?.id) return bySub.id;

  if (event.data.customer_id) {
    const { data: byCustomer } = await supabase
      .from("businesses")
      .select("id")
      .eq("paddle_customer_id", event.data.customer_id)
      .maybeSingle();
    if (byCustomer?.id) return byCustomer.id;
  }

  return null;
}

function trialEndsAtFromEvent(event: PaddleWebhookEvent): string | null {
  return (
    event.data.current_billing_period?.ends_at ??
    event.data.next_billed_at ??
    null
  );
}

export async function processPaddleWebhookEvent(
  event: PaddleWebhookEvent,
  rawPayload: Json,
): Promise<{ ok: boolean; duplicate?: boolean; error?: string }> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("billing_events")
    .select("id")
    .eq("paddle_event_id", event.event_id)
    .maybeSingle();

  if (existing) {
    return { ok: true, duplicate: true };
  }

  const businessId = await resolveBusinessId(event);

  const { error: insertEventError } = await supabase
    .from("billing_events")
    .insert({
      business_id: businessId,
      paddle_event_id: event.event_id,
      event_type: event.event_type,
      payload: rawPayload,
    });

  if (insertEventError) {
    if (insertEventError.message.includes("duplicate")) {
      return { ok: true, duplicate: true };
    }
    return { ok: false, error: insertEventError.message };
  }

  const subscriptionEvents = new Set([
    "subscription.created",
    "subscription.updated",
    "subscription.canceled",
    "subscription.past_due",
    "subscription.activated",
    "subscription.trialing",
  ]);

  if (!subscriptionEvents.has(event.event_type)) {
    return { ok: true };
  }

  if (!businessId) {
    console.error(
      "Paddle webhook: could not resolve business_id for event",
      event.event_id,
      event.event_type,
    );
    return { ok: true };
  }

  const paddleStatus = event.data.status ?? "paused";
  let subscriptionStatus: SubscriptionStatus =
    mapPaddleSubscriptionStatus(paddleStatus);

  if (event.event_type === "subscription.canceled") {
    subscriptionStatus = "canceled";
  }
  if (event.event_type === "subscription.past_due") {
    subscriptionStatus = "past_due";
  }

  const updates: Record<string, unknown> = {
    subscription_status: subscriptionStatus,
    paddle_subscription_id: event.data.id,
  };

  if (event.data.customer_id) {
    updates.paddle_customer_id = event.data.customer_id;
  }

  const trialEnds = trialEndsAtFromEvent(event);
  if (trialEnds && subscriptionStatus === "trialing") {
    updates.trial_ends_at = trialEnds;
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", businessId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}
