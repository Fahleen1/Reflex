import { getTelephonyProviderName } from "@/lib/telephony/config";
import { mockTelephonyProvider } from "@/lib/telephony/mockProvider";
import { twilioTelephonyProvider } from "@/lib/telephony/twilioProvider";
import type { TelephonyProvider } from "@/lib/telephony/types";

export function getTelephonyProvider(): TelephonyProvider {
  const name = getTelephonyProviderName();
  switch (name) {
    case "mock":
      return mockTelephonyProvider;
    case "twilio":
      return twilioTelephonyProvider;
    default: {
      const _exhaustive: never = name;
      return _exhaustive;
    }
  }
}
