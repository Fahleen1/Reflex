import { verifyPaddleSignature } from "@/lib/paddle/signature";
import {
  processPaddleWebhookEvent,
  type PaddleWebhookEvent,
} from "@/lib/paddle/webhook";
import type { Json } from "@/lib/supabase/types";

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("PADDLE_WEBHOOK_SECRET is not configured");
    return new Response("Webhook not configured", { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");

  if (!verifyPaddleSignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 403 });
  }

  let parsed: PaddleWebhookEvent;
  try {
    parsed = JSON.parse(rawBody) as PaddleWebhookEvent;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!parsed.event_id || !parsed.event_type || !parsed.data?.id) {
    return new Response("Malformed event", { status: 400 });
  }

  const result = await processPaddleWebhookEvent(
    parsed,
    JSON.parse(rawBody) as Json,
  );

  if (!result.ok) {
    console.error("Paddle webhook processing failed", result.error);
    return new Response(result.error ?? "Processing failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
