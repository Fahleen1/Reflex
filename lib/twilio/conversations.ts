import { createServiceClient } from "@/lib/supabase/service";

export async function upsertConversation(
  businessId: string,
  callerNumber: string,
): Promise<string> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("business_id", businessId)
    .eq("caller_number", callerNumber)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("conversations")
      .update({ last_message_at: now, status: "open" })
      .eq("id", existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      business_id: businessId,
      caller_number: callerNumber,
      last_message_at: now,
    })
    .select("id")
    .single();

  if (error) {
    const { data: retry } = await supabase
      .from("conversations")
      .select("id")
      .eq("business_id", businessId)
      .eq("caller_number", callerNumber)
      .maybeSingle();
    if (!retry) throw error;
    return retry.id;
  }

  return created.id;
}
