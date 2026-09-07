import twilio from "twilio";

export function validateTwilioSignature(
  signature: string | null,
  url: string,
  params: Record<string, string>,
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!signature || !authToken) {
    return false;
  }

  return twilio.validateRequest(authToken, signature, url, params);
}
