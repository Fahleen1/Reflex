import { randomUUID } from "crypto";
import type {
  SendSmsOptions,
  SendSmsResult,
  TelephonyProvider,
} from "@/lib/telephony/types";

export const mockTelephonyProvider: TelephonyProvider = {
  name: "mock",

  async sendSms({ body }: SendSmsOptions): Promise<SendSmsResult> {
    return {
      sid: `mock_SM${randomUUID().replace(/-/g, "").slice(0, 24)}`,
      status: "delivered",
      provider: "mock",
      simulated: true,
    };
  },
};
