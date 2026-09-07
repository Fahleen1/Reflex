import type { Business } from "@/lib/supabase/types";

export interface DashboardStats {
  missedThisWeek: number;
  autoTextsSent: number;
  autoTextsSkipped: number;
  voiceAnnouncements: number;
  openConversations: number;
  responseRate: string;
  undelivered: number;
}

interface CallStatRow {
  status: string | null;
  auto_text_sent: boolean;
  auto_text_skipped_reason?: string | null;
}

interface MessageStatRow {
  delivery_status: string | null;
}

export function computeCallStats(
  weekCalls: CallStatRow[],
  market: Business["market"],
  openConversations = 0,
  undelivered = 0,
): DashboardStats {
  const isPk = market === "pk";
  const missedThisWeek = weekCalls.filter((c) =>
    ["no-answer", "busy", "failed"].includes(c.status ?? ""),
  ).length;

  const autoTextsSent = weekCalls.filter((c) => c.auto_text_sent).length;
  const autoTextsSkipped = weekCalls.filter(
    (c) => !!c.auto_text_skipped_reason,
  ).length;

  const voiceAnnouncements = isPk
    ? weekCalls.filter((c) =>
        ["no-answer", "busy", "failed"].includes(c.status ?? ""),
      ).length
    : 0;

  // Response rate: auto-texts sent / missed calls that could have been texted
  const eligibleMissed = weekCalls.filter(
    (c) =>
      ["no-answer", "busy", "failed"].includes(c.status ?? "") &&
      (c.auto_text_sent || c.auto_text_skipped_reason),
  ).length;

  const responseRate =
    !isPk && eligibleMissed > 0
      ? `${Math.round((autoTextsSent / eligibleMissed) * 100)}%`
      : !isPk
        ? "—"
        : "n/a";

  return {
    missedThisWeek,
    autoTextsSent,
    autoTextsSkipped,
    voiceAnnouncements,
    openConversations,
    responseRate,
    undelivered,
  };
}

export function countUndelivered(messages: MessageStatRow[]): number {
  return messages.filter((m) =>
    ["failed", "undelivered"].includes(m.delivery_status ?? ""),
  ).length;
}
