import { NextResponse } from "next/server";
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
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const body = (await request.json()) as { message_id?: string };

  if (!body.message_id?.trim()) {
    return NextResponse.json({ error: "message_id is required" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: message } = await service
    .from("messages")
    .select("id, conversation_id")
    .eq("id", body.message_id)
    .maybeSingle();

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const { data: conversation } = await service
    .from("conversations")
    .select("id")
    .eq("id", message.conversation_id)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const { error } = await service
    .from("messages")
    .update({ delivery_status: "failed" })
    .eq("id", body.message_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, simulated: true, delivery_status: "failed" });
}
