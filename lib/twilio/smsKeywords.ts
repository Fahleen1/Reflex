export type SmsKeywordType = "stop" | "help" | "start";

const STOP_KEYWORDS = new Set(["STOP", "UNSUBSCRIBE", "CANCEL"]);
const START_KEYWORDS = new Set(["START", "UNSTOP"]);

export function classifyInboundSms(body: string): SmsKeywordType | null {
  const normalized = body.trim().toUpperCase();
  if (!normalized) return null;

  if (STOP_KEYWORDS.has(normalized)) return "stop";
  if (normalized === "HELP") return "help";
  if (START_KEYWORDS.has(normalized)) return "start";

  return null;
}

export function getHelpReplyMessage(): string {
  const supportEmail =
    process.env.SUPPORT_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? "support@callback.app";
  return `Reflex support: email ${supportEmail} for help with missed-call texts. Reply STOP to opt out.`;
}
