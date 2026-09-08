import type { Business } from "@/lib/supabase/types";
import type { SendSmsResult } from "@/lib/telephony/types";

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

/** @deprecated Import from `@/lib/telephony/sendSms` instead. */
export { sendOutboundSms } from "@/lib/telephony/sendSms";

export type { SendSmsResult };
