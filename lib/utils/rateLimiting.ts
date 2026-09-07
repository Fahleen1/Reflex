import { createServiceClient } from "@/lib/supabase/service";

const COOLDOWN_MS = 30 * 60 * 1000;

export async function isAutoTextCooldownActive(
  businessId: string,
  callerNumber: string,
): Promise<boolean> {
  const supabase = createServiceClient();
  const cutoff = new Date(Date.now() - COOLDOWN_MS).toISOString();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("business_id", businessId)
    .eq("caller_number", callerNumber)
    .gte("last_message_at", cutoff)
    .maybeSingle();

  if (!conversation) {
    return false;
  }

  const { data: recentSystemMessage } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversation.id)
    .eq("sent_by", "system")
    .eq("direction", "outbound")
    .gte("created_at", cutoff)
    .limit(1)
    .maybeSingle();

  return !!recentSystemMessage;
}
