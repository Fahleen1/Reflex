import { createServiceClient } from "@/lib/supabase/service";
import { notifyOwnerOfNewReply } from "@/lib/email/notifyOwner";
import { upsertConversation } from "@/lib/twilio/conversations";
import {
  classifyInboundSms,
  getHelpReplyMessage,
} from "@/lib/twilio/smsKeywords";
import {
  messagingXmlResponse,
  twimlMessagingResponse,
} from "@/lib/twilio/sms";
import {
  lookupBusinessByTwilioNumber,
  normalizeCallerNumber,
  verifyTwilioWebhook,
} from "@/lib/twilio/webhook";

const SMS_PATH = "/api/twilio/sms";

export async function POST(request: Request) {
  const verified = await verifyTwilioWebhook(request, SMS_PATH);
  if (!verified) {
    return new Response("Forbidden", { status: 403 });
  }

  const { params } = verified;
  const to = params.To;
  const from = params.From;
  const body = params.Body ?? "";
  const messageSid = params.MessageSid;

  if (!to || !from) {
    return messagingXmlResponse(twimlMessagingResponse());
  }

  const business = await lookupBusinessByTwilioNumber(to);
  if (!business) {
    console.error("Twilio SMS webhook: business not found for To=", to);
    return messagingXmlResponse(twimlMessagingResponse());
  }

  if (business.market === "pk") {
    return messagingXmlResponse(twimlMessagingResponse());
  }

  const callerNumber = normalizeCallerNumber(from, business.market);
  if (!callerNumber) {
    return messagingXmlResponse(twimlMessagingResponse());
  }

  const supabase = createServiceClient();
  const keyword = classifyInboundSms(body);

  if (keyword === "stop") {
    const conversationId = await upsertConversation(business.id, callerNumber);
    await supabase
      .from("conversations")
      .update({ opted_out: true })
      .eq("id", conversationId);
    return messagingXmlResponse(twimlMessagingResponse());
  }

  if (keyword === "start") {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("business_id", business.id)
      .eq("caller_number", callerNumber)
      .maybeSingle();

    if (conversation) {
      await supabase
        .from("conversations")
        .update({ opted_out: false })
        .eq("id", conversation.id);
    }

    return messagingXmlResponse(
      twimlMessagingResponse(
        "You have been resubscribed to messages from this business. Reply STOP to opt out.",
      ),
    );
  }

  if (keyword === "help") {
    return messagingXmlResponse(twimlMessagingResponse(getHelpReplyMessage()));
  }

  if (messageSid) {
    const { data: existingMessage } = await supabase
      .from("messages")
      .select("id")
      .eq("message_sid", messageSid)
      .maybeSingle();

    if (existingMessage) {
      return messagingXmlResponse(twimlMessagingResponse());
    }
  }

  const conversationId = await upsertConversation(business.id, callerNumber);
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    direction: "inbound",
    body,
    message_sid: messageSid ?? null,
    delivery_status: "received",
    sent_by: null,
  });

  if (insertError && !insertError.message.includes("duplicate")) {
    console.error("Twilio SMS webhook: failed to insert message", insertError);
    return messagingXmlResponse(twimlMessagingResponse());
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: now })
    .eq("id", conversationId);

  notifyOwnerOfNewReply({
    businessId: business.id,
    businessName: business.name,
    callerNumber,
    messagePreview: body,
  }).catch((err) => console.error("Owner notification failed", err));

  return messagingXmlResponse(twimlMessagingResponse());
}
