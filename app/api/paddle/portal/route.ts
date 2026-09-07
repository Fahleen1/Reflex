import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaddleClient, isPaddleConfigured } from "@/lib/paddle/client";
import type { Business } from "@/lib/supabase/types";

export async function POST() {
  if (!isPaddleConfigured()) {
    return NextResponse.json(
      { error: "Paddle is not configured" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  const business = data as Business | null;
  if (!business?.paddle_customer_id) {
    return NextResponse.json(
      { error: "No Paddle customer on file. Start a trial first." },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const paddle = getPaddleClient();

  const session = await paddle.customerPortalSessions.create(
    business.paddle_customer_id,
    business.paddle_subscription_id
      ? [business.paddle_subscription_id]
      : [],
  );

  const portalUrl = session.urls?.general?.overview;
  if (!portalUrl) {
    console.error("Unexpected portal session response", session);
    return NextResponse.json(
      { error: "Could not create customer portal session" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    url: portalUrl,
    return_url: `${appUrl}/settings/billing`,
  });
}
