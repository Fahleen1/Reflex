import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isMockTelephonyEnabled } from "@/lib/telephony/config";

function mockGuard() {
  if (!isMockTelephonyEnabled()) {
    return NextResponse.json(
      { error: "Simulator requires TELEPHONY_PROVIDER=mock" },
      { status: 403 },
    );
  }
  return null;
}

export async function POST(request: Request) {
  const blocked = mockGuard();
  if (blocked) return blocked;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, market")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!business || business.market === "pk") {
    return NextResponse.json({ error: "Not available for PK track" }, { status: 404 });
  }

  const body = (await request.json()) as {
    conversation_id?: string;
    body?: string;
  };

  if (!body.conversation_id?.trim() || !body.body?.trim()) {
    return NextResponse.json(
      { error: "conversation_id and body are required" },
      { status: 400 },
    );
  }

  const service = createServiceClient();

  const { data: conversation } = await service
    .from("conversations")
    .select("id, caller_number, opted_out")
    .eq("id", body.conversation_id)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const messageSid = `mock_SM${randomUUID().replace(/-/g, "").slice(0, 24)}`;

  const { data: message, error } = await service
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      direction: "inbound",
      body: body.body.trim(),
      message_sid: messageSid,
      delivery_status: "received",
      sent_by: "customer",
    })
    .select("id, body, created_at, direction, delivery_status, message_sid")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await service
    .from("conversations")
    .update({ last_message_at: now })
    .eq("id", conversation.id);

  return NextResponse.json({ ok: true, simulated: true, message });
}
