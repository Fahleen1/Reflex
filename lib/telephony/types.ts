import type { Business } from "@/lib/supabase/types";

export type TelephonyProviderName = "twilio" | "mock";

export interface SendSmsOptions {
  to: string;
  body: string;
  business: Business;
}

export interface SendSmsResult {
  sid: string;
  status: string;
  provider: TelephonyProviderName;
  simulated: boolean;
}

export interface TelephonyProvider {
  readonly name: TelephonyProviderName;
  sendSms(options: SendSmsOptions): Promise<SendSmsResult>;
}
