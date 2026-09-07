import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/supabase/types";

async function getOwnerBusiness(userId: string): Promise<Business | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", userId)
    .maybeSingle();
  return data as Business | null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getOwnerBusiness(user.id);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  if (business.market === "pk") {
    return NextResponse.json({ conversations: [] });
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, caller_number, last_message_at, status, opted_out, created_at")
    .eq("business_id", business.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const conversationIds = (conversations ?? []).map((c) => c.id);
  let previews: Record<string, string> = {};

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

  const enriched = (conversations ?? []).map((c) => ({
    ...c,
    preview: previews[c.id] ?? null,
  }));

  return NextResponse.json({ conversations: enriched });
}
