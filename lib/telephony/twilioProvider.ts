import { getTwilioClient } from "@/lib/twilio/client";
import { getSmsStatusCallbackUrl } from "@/lib/twilio/messaging";
import type {
  SendSmsOptions,
  SendSmsResult,
  TelephonyProvider,
} from "@/lib/telephony/types";

export const twilioTelephonyProvider: TelephonyProvider = {
  name: "twilio",

  async sendSms({ to, body, business }: SendSmsOptions): Promise<SendSmsResult> {
    const twilio = getTwilioClient();
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const statusCallback = getSmsStatusCallbackUrl();

    const message = await twilio.messages.create({
      to,
      body,
      ...(statusCallback ? { statusCallback } : {}),
      ...(messagingServiceSid
        ? { messagingServiceSid }
        : { from: business.twilio_number! }),
    });

    return {
      sid: message.sid,
      status: message.status ?? "queued",
      provider: "twilio",
      simulated: false,
    };
  },
};
