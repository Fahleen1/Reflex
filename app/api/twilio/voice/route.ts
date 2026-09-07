import { createServiceClient } from "@/lib/supabase/service";
import {
  lookupBusinessByTwilioNumber,
  normalizeCallerNumber,
  twimlXmlResponse,
  verifyTwilioWebhook,
} from "@/lib/twilio/webhook";
import { twimlDial, twimlHangup } from "@/lib/twilio/voice";

const VOICE_PATH = "/api/twilio/voice";

export async function POST(request: Request) {
  const verified = await verifyTwilioWebhook(request, VOICE_PATH);
  if (!verified) {
    return new Response("Forbidden", { status: 403 });
  }

  const { params } = verified;
  const callSid = params.CallSid;
  const from = params.From;
  const to = params.To;

  if (!callSid || !to) {
    return twimlXmlResponse(twimlHangup());
  }

  const business = await lookupBusinessByTwilioNumber(to);
  if (!business || !business.forwarding_number) {
    console.error("Twilio voice webhook: business not found for To=", to);
    return twimlXmlResponse(twimlHangup());
  }

  const callerNumber = normalizeCallerNumber(from, business.market);
  const supabase = createServiceClient();

  const { error: insertError } = await supabase.from("calls").insert({
    business_id: business.id,
    call_sid: callSid,
    caller_number: callerNumber,
    parent_call_sid: null,
  });

  if (insertError && !insertError.message.includes("duplicate")) {
    console.error("Twilio voice webhook: failed to insert call", insertError);
    return twimlXmlResponse(twimlHangup());
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const statusCallbackUrl = `${appUrl}/api/twilio/voice-status`;

  return twimlXmlResponse(
    twimlDial(business.forwarding_number, statusCallbackUrl),
  );
}
