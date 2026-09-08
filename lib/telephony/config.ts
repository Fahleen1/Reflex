import type { TelephonyProviderName } from "@/lib/telephony/types";

export function getTelephonyProviderName(): TelephonyProviderName {
  const configured = process.env.TELEPHONY_PROVIDER?.toLowerCase();
  if (configured === "mock") {
    return "mock";
  }
  return "twilio";
}

export function isMockTelephonyEnabled(): boolean {
  return getTelephonyProviderName() === "mock";
}

export function isSimulatedMessageSid(sid: string | null | undefined): boolean {
  return !!sid && sid.startsWith("mock_");
}
