const XML_ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => XML_ESCAPE[char] ?? char);
}

export function twimlResponse(inner: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;
}

export function twimlHangup(): string {
  return twimlResponse("<Hangup/>");
}

export function twimlDial(forwardingNumber: string, statusCallbackUrl: string): string {
  return twimlResponse(
    `<Dial timeout="20" action="${escapeXml(statusCallbackUrl)}">${escapeXml(forwardingNumber)}</Dial>`,
  );
}

export function twimlSayAndHangup(message: string, voice = "Polly.Joanna"): string {
  return twimlResponse(
    `<Say voice="${escapeXml(voice)}">${escapeXml(message)}</Say><Hangup/>`,
  );
}

export function twimlEmpty(): string {
  return twimlResponse("");
}

export const MISSED_CALL_STATUSES = new Set(["no-answer", "busy", "failed"]);

export function mapDialCallStatus(
  dialCallStatus: string | undefined,
): "no-answer" | "completed" | "busy" | "failed" | "canceled" | null {
  switch (dialCallStatus) {
    case "no-answer":
    case "completed":
    case "busy":
    case "failed":
    case "canceled":
      return dialCallStatus;
    default:
      return null;
  }
}
