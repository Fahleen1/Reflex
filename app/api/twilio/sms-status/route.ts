import { createServiceClient } from "@/lib/supabase/service";
import { verifyTwilioWebhook } from "@/lib/twilio/webhook";

const SMS_STATUS_PATH = "/api/twilio/sms-status";

const KNOWN_STATUSES = new Set([
  "queued",
  "sent",
  "delivered",
  "failed",
  "undelivered",
  "receiving",
  "accepted",
]);

export async function POST(request: Request) {
  const verified = await verifyTwilioWebhook(request, SMS_STATUS_PATH);
  if (!verified) {
    return new Response("Forbidden", { status: 403 });
  }

  const { params } = verified;
  const messageSid = params.MessageSid;
  const messageStatus = params.MessageStatus?.toLowerCase();

  if (!messageSid || !messageStatus || !KNOWN_STATUSES.has(messageStatus)) {
    return new Response("OK", { status: 200 });
  }

  const supabase = createServiceClient();
  await supabase
    .from("messages")
    .update({ delivery_status: messageStatus })
    .eq("message_sid", messageSid);

  return new Response("OK", { status: 200 });
}
