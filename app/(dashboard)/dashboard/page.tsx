import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { WhatsAppInfoCard } from "@/components/dashboard/WhatsAppInfoCard";
import {
  CallLogTable,
  type CallLogEntry,
} from "@/components/dashboard/CallLogTable";
import { StatsCards } from "@/components/dashboard/StatsCards";
import {
  computeCallStats,
  countUndelivered,
} from "@/lib/utils/stats";
import { isOnboardingComplete } from "@/lib/utils/onboarding";
import type { Business } from "@/lib/supabase/types";

function weekStartIso(): string {
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return start.toISOString();
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  const business = data as Business | null;

  if (!business || !isOnboardingComplete(business)) {
    redirect("/onboarding");
  }

  const isPk = business.market === "pk";
  const weekStart = weekStartIso();

  const { data: recentCalls } = await supabase
    .from("calls")
    .select(
      "id, caller_number, status, auto_text_sent, auto_text_skipped_reason, created_at",
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: weekCalls } = await supabase
    .from("calls")
    .select("status, auto_text_sent, auto_text_skipped_reason")
    .eq("business_id", business.id)
    .gte("created_at", weekStart);

  const calls = (recentCalls ?? []) as CallLogEntry[];
  const week = weekCalls ?? [];

  let openConversations = 0;
  let undelivered = 0;

  if (!isPk) {
    const { count } = await supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("status", "open");
    openConversations = count ?? 0;

    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("business_id", business.id);

    const conversationIds = (conversations ?? []).map((c) => c.id);
    if (conversationIds.length > 0) {
      const { data: messages } = await supabase
        .from("messages")
        .select("delivery_status")
        .in("conversation_id", conversationIds)
        .gte("created_at", weekStart);
      undelivered = countUndelivered(messages ?? []);
    }
  }

  const stats = computeCallStats(
    week,
    business.market,
    openConversations,
    undelivered,
  );

  const statCards = isPk
    ? [
        {
          label: "Missed calls this week",
          value: String(stats.missedThisWeek),
        },
        {
          label: "Voice announcements (7d)",
          value: String(stats.voiceAnnouncements),
        },
      ]
    : [
        {
          label: "Missed calls this week",
          value: String(stats.missedThisWeek),
        },
        {
          label: "Auto-texts sent (7d)",
          value: String(stats.autoTextsSent),
        },
        {
          label: "Response rate (7d)",
          value: stats.responseRate,
          hint: "Auto-texts sent ÷ missed calls handled",
        },
        {
          label: "Skipped / undelivered",
          value: `${stats.autoTextsSkipped} / ${stats.undelivered}`,
          hint: "Skipped auto-texts · failed SMS (7d)",
        },
      ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {business.name}
        </h1>
        <p className="mt-1 text-gray-600">
          {isPk
            ? "Missed calls play a voice message pointing callers to WhatsApp."
            : "Here's an overview of your missed-call activity."}
        </p>
      </div>

      {isPk && business.whatsapp_number && (
        <WhatsAppInfoCard
          whatsappNumber={business.whatsapp_number}
          voiceMessage={business.missed_call_voice_message}
          twilioNumber={business.twilio_number}
        />
      )}

      <StatsCards stats={statCards} />

      {!isPk && business.caller_id_mode === "unknown" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Caller ID is not verified — auto-texts are paused.{" "}
          <Link
            href="/settings/number"
            className="font-medium underline hover:no-underline"
          >
            Re-verify on Phone number settings
          </Link>
          .
        </div>
      )}

      <CallLogTable calls={calls} market={business.market} />

      <div className="flex gap-3">
        {!isPk && (
          <Link href="/inbox">
            <Button variant="secondary">View inbox</Button>
          </Link>
        )}
        <Link href="/settings/business">
          <Button variant={isPk ? "secondary" : "ghost"}>
            Business settings
          </Button>
        </Link>
        <Link href="/settings/number">
          <Button variant="ghost">Phone number</Button>
        </Link>
      </div>
    </div>
  );
}
