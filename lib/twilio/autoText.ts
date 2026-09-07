import { createServiceClient } from "@/lib/supabase/service";
import { sendOutboundSms } from "@/lib/twilio/messaging";
import { renderMessageTemplate } from "@/lib/twilio/templates";
import { isAutoTextCooldownActive } from "@/lib/utils/rateLimiting";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";
import type { Business } from "@/lib/supabase/types";

export type AutoTextSkipReason =
  | "caller_id_unavailable"
  | "opted_out"
  | "cooldown_active";

export interface AutoTextResult {
  sent: boolean;
  skipReason?: AutoTextSkipReason;
  conversationId?: string;
}

function isCallerIdUnavailable(
  business: Business,
  callerNumber: string | null,
): boolean {
  if (
    business.caller_id_mode === "anonymous" ||
    business.caller_id_mode === "unknown"
  ) {
    return true;
  }
  return callerNumber === null;
}

export async function sendMissedCallAutoText(
  business: Business,
  callId: string,
  callerNumber: string | null,
): Promise<AutoTextResult> {
  const supabase = createServiceClient();

  const { data: callRow } = await supabase
    .from("calls")
    .select("auto_text_sent, auto_text_skipped_reason")
    .eq("id", callId)
    .maybeSingle();

  if (callRow?.auto_text_sent) {
    return { sent: true };
  }

  if (callRow?.auto_text_skipped_reason) {
    return {
      sent: false,
      skipReason: callRow.auto_text_skipped_reason as AutoTextSkipReason,
    };
  }

  if (isCallerIdUnavailable(business, callerNumber)) {
    await supabase
      .from("calls")
      .update({ auto_text_skipped_reason: "caller_id_unavailable" })
      .eq("id", callId);
    return { sent: false, skipReason: "caller_id_unavailable" };
  }

  if (!callerNumber) {
    return { sent: false, skipReason: "caller_id_unavailable" };
  }

  const resolvedCaller = callerNumber;

  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id, opted_out")
    .eq("business_id", business.id)
    .eq("caller_number", resolvedCaller)
    .maybeSingle();

  if (existingConversation?.opted_out) {
    await supabase
      .from("calls")
      .update({ auto_text_skipped_reason: "opted_out" })
      .eq("id", callId);
    return { sent: false, skipReason: "opted_out" };
  }

  const cooldownActive = await isAutoTextCooldownActive(
    business.id,
    resolvedCaller,
  );
  if (cooldownActive) {
    await supabase
      .from("calls")
      .update({ auto_text_skipped_reason: "cooldown_active" })
      .eq("id", callId);
    return { sent: false, skipReason: "cooldown_active" };
  }

  const body = renderMessageTemplate(business.message_template, {
    business_name: business.name,
  });

  const message = await sendOutboundSms({
    to: resolvedCaller,
    body,
    business,
  });

  const now = new Date().toISOString();

  let conversationId = existingConversation?.id;

  if (conversationId) {
    await supabase
      .from("conversations")
      .update({ last_message_at: now })
      .eq("id", conversationId);
  } else {
    const { data: newConversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        business_id: business.id,
        caller_number: resolvedCaller,
        last_message_at: now,
      })
      .select("id")
      .single();

    if (conversationError) {
      const { data: retryConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("business_id", business.id)
        .eq("caller_number", resolvedCaller)
        .maybeSingle();
      conversationId = retryConversation?.id;
    } else {
      conversationId = newConversation.id;
    }
  }

  if (!conversationId) {
    throw new Error("Failed to resolve conversation for auto-text");
  }

  const { error: messageError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    direction: "outbound",
    body,
    message_sid: message.sid,
    delivery_status: message.status ?? "queued",
    sent_by: "system",
  });

  if (messageError && !messageError.message.includes("duplicate")) {
    throw messageError;
  }

  await supabase
    .from("calls")
    .update({
      auto_text_sent: true,
      conversation_id: conversationId,
      auto_text_skipped_reason: null,
    })
    .eq("id", callId);

  return { sent: true, conversationId };
}

export function buildPkVoiceAnnouncement(business: Business): string {
  const base = business.missed_call_voice_message.trim();
  if (!business.whatsapp_number) {
    return base;
  }

  const spokenNumber = formatPhoneDisplay(business.whatsapp_number);
  return `${base} Please message us on WhatsApp at ${spokenNumber}.`;
}
