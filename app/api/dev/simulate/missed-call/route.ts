import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isMockTelephonyEnabled } from "@/lib/telephony/config";
import { isMissedCallStatus } from "@/lib/telephony/missedCall";
import { sendMissedCallAutoText } from "@/lib/twilio/autoText";
import type { Business } from "@/lib/supabase/types";

function mockGuard() {
  if (!isMockTelephonyEnabled()) {
    return NextResponse.json(
      { error: "Simulator requires TELEPHONY_PROVIDER=mock" },
      { status: 403 },
    );
  }
  return null;
}

async function getOwnerBusiness(userId: string): Promise<Business | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", userId)
    .maybeSingle();
  return data as Business | null;
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

  const business = await getOwnerBusiness(user.id);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const body = (await request.json()) as {
    caller_number?: string;
    dial_status?: "no-answer" | "completed" | "busy" | "failed";
  };

  const callerNumber = body.caller_number?.trim() || "+15550142281";
  const dialStatus = body.dial_status ?? "no-answer";

  if (
    dialStatus !== "no-answer" &&
    dialStatus !== "completed" &&
    dialStatus !== "busy" &&
    dialStatus !== "failed"
  ) {
    return NextResponse.json({ error: "Invalid dial_status" }, { status: 400 });
  }

  const service = createServiceClient();
  const callSid = `mock_CA${randomUUID().replace(/-/g, "").slice(0, 24)}`;

  const { data: callRow, error: insertError } = await service
    .from("calls")
    .insert({
      business_id: business.id,
      call_sid: callSid,
      caller_number: callerNumber,
      status: dialStatus,
      parent_call_sid: null,
    })
    .select("id, caller_number")
    .single();

  if (insertError || !callRow) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create call" },
      { status: 500 },
    );
  }

  let autoTextResult = null;

  if (business.market === "us" && isMissedCallStatus(dialStatus)) {
    autoTextResult = await sendMissedCallAutoText(
      business,
      callRow.id,
      callRow.caller_number,
    );
  }

  return NextResponse.json({
    ok: true,
    simulated: true,
    call_id: callRow.id,
    call_sid: callSid,
    dial_status: dialStatus,
    auto_text: autoTextResult,
  });
}
