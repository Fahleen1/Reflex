import twilio from "twilio";

let client: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
    );
  }
  return client;
}

export function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN
  );
}

/**
 * Provision a new US local phone number via Twilio.
 * Falls back to null if Twilio is not configured.
 */
export async function provisionPhoneNumber(): Promise<string | null> {
  if (!isTwilioConfigured()) return null;

  const twilioClient = getTwilioClient();
  const numbers = await twilioClient.availablePhoneNumbers("US").local.list({
    smsEnabled: true,
    voiceEnabled: true,
    limit: 1,
  });

  if (numbers.length === 0) return null;

  const purchased = await twilioClient.incomingPhoneNumbers.create({
    phoneNumber: numbers[0].phoneNumber,
    smsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/sms`,
    voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice`,
  });

  return purchased.phoneNumber;
}
