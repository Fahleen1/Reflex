/**
 * Build a WhatsApp click-to-chat link from an E.164 number.
 * Strips the leading + for wa.me URLs (e.g. +923001234567 → 923001234567).
 */
export function buildWaMeLink(e164: string, prefilledMessage?: string): string {
  const digits = e164.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  if (!prefilledMessage?.trim()) return base;
  return `${base}?text=${encodeURIComponent(prefilledMessage.trim())}`;
}
