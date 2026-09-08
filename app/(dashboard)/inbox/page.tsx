import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WhatsAppInfoCard } from "@/components/dashboard/WhatsAppInfoCard";
import {
  ConversationList,
  type ConversationSummary,
} from "@/components/dashboard/ConversationList";
import {
  ConversationThread,
  type ThreadMessage,
} from "@/components/dashboard/ConversationThread";
import type { Business } from "@/lib/supabase/types";

interface InboxPageProps {
  searchParams: Promise<{ c?: string }>;
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const { c: selectedId } = await searchParams;

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

  if (!business) redirect("/onboarding");

  if (business.market === "pk") {
    if (!business.whatsapp_number) redirect("/onboarding");

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
          <p className="mt-1 text-gray-600">
            Customers message you directly on WhatsApp. Replies happen in your
            WhatsApp app — there is no SMS inbox for Pakistan-track businesses.
          </p>
        </div>
        <WhatsAppInfoCard
          whatsappNumber={business.whatsapp_number}
          voiceMessage={business.missed_call_voice_message}
          twilioNumber={business.twilio_number}
        />
      </div>
    );
  }

  const { data: conversationsRaw } = await supabase
    .from("conversations")
    .select("id, caller_number, last_message_at, status, opted_out, created_at")
    .eq("business_id", business.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const conversationIds = (conversationsRaw ?? []).map((c) => c.id);
  const previews: Record<string, string> = {};

  if (conversationIds.length > 0) {
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("conversation_id, body, created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    for (const msg of recentMessages ?? []) {
      if (!previews[msg.conversation_id]) {
        previews[msg.conversation_id] = msg.body;
      }
    }
  }

  const conversations: ConversationSummary[] = (conversationsRaw ?? []).map(
    (c) => ({
      ...c,
      preview: previews[c.id] ?? null,
    }),
  );

  let selectedConversation: {
    id: string;
    caller_number: string;
    opted_out: boolean;
  } | null = null;
  let threadMessages: ThreadMessage[] = [];

  if (selectedId) {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, caller_number, opted_out")
      .eq("id", selectedId)
      .eq("business_id", business.id)
      .maybeSingle();

    if (conversation) {
      selectedConversation = conversation;
      const { data: messages } = await supabase
        .from("messages")
        .select("id, direction, body, delivery_status, created_at, message_sid")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });

      threadMessages = (messages ?? []) as ThreadMessage[];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <p className="mt-1 text-gray-600">
          SMS conversations with customers who replied to your missed-call texts.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
        />
        <div>
          {selectedConversation ? (
            <ConversationThread
              conversationId={selectedConversation.id}
              callerNumber={selectedConversation.caller_number}
              optedOut={selectedConversation.opted_out}
              messages={threadMessages}
            />
          ) : (
            <div className="flex min-h-[480px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-8 text-sm text-gray-500">
              Select a conversation to view the thread and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
