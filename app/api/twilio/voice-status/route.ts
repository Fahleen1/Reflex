import { createServiceClient } from "@/lib/supabase/service";
import {
  buildPkVoiceAnnouncement,
  sendMissedCallAutoText,
} from "@/lib/twilio/autoText";
import {
  lookupBusinessByTwilioNumber,
  twimlXmlResponse,
  verifyTwilioWebhook,
} from "@/lib/twilio/webhook";
import {
  mapDialCallStatus,
  MISSED_CALL_STATUSES,
  twimlEmpty,
  twimlHangup,
  twimlSayAndHangup,
} from "@/lib/twilio/voice";
import type { Business } from "@/lib/supabase/types";

const VOICE_STATUS_PATH = "/api/twilio/voice-status";

export async function POST(request: Request) {
  const verified = await verifyTwilioWebhook(request, VOICE_STATUS_PATH);
  if (!verified) {
    return new Response("Forbidden", { status: 403 });
  }

  const { params } = verified;
  const to = params.To;
  const parentCallSid = params.ParentCallSid;
  const dialCallStatus = params.DialCallStatus;
  const dialCallDuration = params.DialCallDuration;

  if (!to) {
    return twimlXmlResponse(twimlHangup());
  }

  const business = await lookupBusinessByTwilioNumber(to);
  if (!business) {
    console.error("Twilio voice-status: business not found for To=", to);
    return twimlXmlResponse(twimlHangup());
  }

  const mappedStatus = mapDialCallStatus(dialCallStatus);
  const supabase = createServiceClient();

  if (!parentCallSid) {
    return twimlXmlResponse(twimlEmpty());
  }

  const { data: callRow } = await supabase
    .from("calls")
    .select("*")
    .eq("call_sid", parentCallSid)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!callRow) {
    return twimlXmlResponse(twimlEmpty());
  }

  const durationSeconds = dialCallDuration
    ? parseInt(dialCallDuration, 10)
    : null;

  await supabase
    .from("calls")
    .update({
      status: mappedStatus,
      duration_seconds: Number.isNaN(durationSeconds) ? null : durationSeconds,
      parent_call_sid: parentCallSid,
    })
    .eq("id", callRow.id);

  if (!mappedStatus || !MISSED_CALL_STATUSES.has(mappedStatus)) {
    return twimlXmlResponse(twimlEmpty());
  }

  if (business.market === "pk") {
    return handlePkMissedCall(business);
  }

  return handleUsMissedCall(business, callRow.id, callRow.caller_number);
}

async function handlePkMissedCall(business: Business): Promise<Response> {
  const announcement = buildPkVoiceAnnouncement(business);
  return twimlXmlResponse(twimlSayAndHangup(announcement));
}

async function handleUsMissedCall(
  business: Business,
  callId: string,
  callerNumber: string | null,
): Promise<Response> {
  try {
    await sendMissedCallAutoText(business, callId, callerNumber);
  } catch (error) {
    console.error("Twilio voice-status: auto-text failed", error);
  }

  return twimlXmlResponse(twimlEmpty());
}
