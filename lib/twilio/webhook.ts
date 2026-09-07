import { createServiceClient } from "@/lib/supabase/service";
import type { Business } from "@/lib/supabase/types";
import { formatPhone, type PhoneCountry } from "@/lib/utils/formatPhone";
import { validateTwilioSignature } from "@/lib/twilio/signature";

export type TwilioParams = Record<string, string>;

export function parseTwilioParams(body: string): TwilioParams {
  const params: TwilioParams = {};
  for (const [key, value] of new URLSearchParams(body)) {
    params[key] = value;
  }
  return params;
}

export function getWebhookUrl(request: Request, pathname: string): string {
  const configuredBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configuredBase) {
    return `${configuredBase}${pathname}`;
  }

  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProto ?? url.protocol.replace(":", "");
  return `${protocol}://${url.host}${pathname}`;
}

export interface VerifiedTwilioRequest {
  params: TwilioParams;
  webhookUrl: string;
}

export async function verifyTwilioWebhook(
  request: Request,
  pathname: string,
): Promise<VerifiedTwilioRequest | null> {
  const body = await request.text();
  const params = parseTwilioParams(body);
  const webhookUrl = getWebhookUrl(request, pathname);
  const signature = request.headers.get("X-Twilio-Signature");

  if (!validateTwilioSignature(signature, webhookUrl, params)) {
    return null;
  }

  return { params, webhookUrl };
}

export function twimlXmlResponse(twiml: string): Response {
  return new Response(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function lookupBusinessByTwilioNumber(
  toNumber: string,
): Promise<Business | null> {
  const supabase = createServiceClient();

  const normalized = formatPhone(toNumber, "US") ?? formatPhone(toNumber, "PK");
  if (!normalized) {
    return null;
  }

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("twilio_number", normalized)
    .maybeSingle();

  return data as Business | null;
}

export function phoneCountryForMarket(market: Business["market"]): PhoneCountry {
  return market === "pk" ? "PK" : "US";
}

export function normalizeCallerNumber(
  from: string | undefined,
  market: Business["market"],
): string | null {
  if (!from || from.toLowerCase() === "anonymous") {
    return null;
  }
  return formatPhone(from, phoneCountryForMarket(market));
}

export function isAnonymousCaller(from: string | undefined): boolean {
  if (!from) return true;
  const lower = from.toLowerCase();
  return lower === "anonymous" || lower === "restricted";
}
