import { getTelephonyProvider } from "@/lib/telephony/provider";
import type { SendSmsOptions, SendSmsResult } from "@/lib/telephony/types";

export async function sendOutboundSms(
  options: SendSmsOptions,
): Promise<SendSmsResult> {
  const provider = getTelephonyProvider();
  return provider.sendSms(options);
}
