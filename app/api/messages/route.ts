import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOutboundSms } from "@/lib/twilio/messaging";
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

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getOwnerBusiness(user.id);
  if (!business || business.market === "pk") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversation_id");

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversation_id is required" },
      { status: 400 },
    );
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, business_id, caller_number, opted_out")
    .eq("id", conversationId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      "id, direction, body, delivery_status, sent_by, created_at, message_sid",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversation, messages: messages ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getOwnerBusiness(user.id);
  if (!business || business.market === "pk") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const body = await request.json();
  const { conversation_id: conversationId, body: messageBody } = body as {
    conversation_id?: string;
    body?: string;
  };

  if (!conversationId?.trim() || !messageBody?.trim()) {
    return NextResponse.json(
      { error: "conversation_id and body are required" },
      { status: 400 },
    );
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, caller_number, opted_out")
    .eq("id", conversationId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  if (conversation.opted_out) {
    return NextResponse.json(
      { error: "This caller has opted out. They must reply START to receive messages." },
      { status: 400 },
    );
  }

  const trimmedBody = messageBody.trim();

  const twilioMessage = await sendOutboundSms({
    to: conversation.caller_number,
    body: trimmedBody,
    business,
  });

  const now = new Date().toISOString();

  await supabase
    .from("conversations")
    .update({ last_message_at: now })
    .eq("id", conversationId);

  const { data: message, error: insertError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      direction: "outbound",
      body: trimmedBody,
      message_sid: twilioMessage.sid,
      delivery_status: twilioMessage.status ?? "queued",
      sent_by: user.id,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message });
}
