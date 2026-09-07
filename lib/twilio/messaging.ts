import { getTwilioClient } from "@/lib/twilio/client";
import type { Business } from "@/lib/supabase/types";

export function getSmsStatusCallbackUrl(): string | undefined {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!base) return undefined;
  return `${base}/api/twilio/sms-status`;
}

export interface SendSmsOptions {
  to: string;
  body: string;
  business: Business;
}

export async function sendOutboundSms({ to, body, business }: SendSmsOptions) {
  const twilio = getTwilioClient();
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const statusCallback = getSmsStatusCallbackUrl();

  return twilio.messages.create({
    to,
    body,
    ...(statusCallback ? { statusCallback } : {}),
    ...(messagingServiceSid
      ? { messagingServiceSid }
      : { from: business.twilio_number! }),
  });
}
