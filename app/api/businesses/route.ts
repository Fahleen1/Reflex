import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatPhone, type PhoneCountry } from "@/lib/utils/formatPhone";
import { buildWaMeLink } from "@/lib/utils/waMeLink";
import { provisionPhoneNumber } from "@/lib/twilio/client";
import { DEFAULT_VOICE_MESSAGE } from "@/lib/constants/onboarding";
import type { BusinessUpdate, Json, Market } from "@/lib/supabase/types";

function phoneCountryForMarket(market: Market): PhoneCountry {
  return market === "pk" ? "PK" : "US";
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const wa_me_link =
    business?.whatsapp_number != null
      ? buildWaMeLink(business.whatsapp_number)
      : null;

  return NextResponse.json({ business, wa_me_link });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    industry,
    market = "us",
    forwarding_number,
    whatsapp_number,
    missed_call_voice_message,
    timezone,
    business_hours,
    consent_accepted,
  } = body as {
    name: string;
    industry?: string;
    market?: Market;
    forwarding_number: string;
    whatsapp_number?: string;
    missed_call_voice_message?: string;
    timezone?: string;
    business_hours?: Json;
    consent_accepted?: boolean;
  };

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Business name is required" },
      { status: 400 },
    );
  }

  if (market !== "us" && market !== "pk") {
    return NextResponse.json({ error: "Invalid market" }, { status: 400 });
  }

  if (market === "us" && !consent_accepted) {
    return NextResponse.json(
      { error: "You must accept the SMS consent notice" },
      { status: 400 },
    );
  }

  const phoneCountry = phoneCountryForMarket(market);
  const normalizedForwarding = formatPhone(forwarding_number, phoneCountry);
  if (!normalizedForwarding) {
    return NextResponse.json(
      {
        error:
          market === "pk"
            ? "Invalid forwarding phone number. Use a valid Pakistan number."
            : "Invalid forwarding phone number. Use a valid US number.",
      },
      { status: 400 },
    );
  }

  let normalizedWhatsapp: string | null = null;
  if (market === "pk") {
    if (!whatsapp_number?.trim()) {
      return NextResponse.json(
        { error: "WhatsApp number is required for Pakistan businesses" },
        { status: 400 },
      );
    }
    normalizedWhatsapp = formatPhone(whatsapp_number, "PK");
    if (!normalizedWhatsapp) {
      return NextResponse.json(
        { error: "Invalid WhatsApp number. Use a valid Pakistan number." },
        { status: 400 },
      );
    }
  }

  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Business profile already exists" },
      { status: 409 },
    );
  }

  let twilioNumber: string | null = null;
  try {
    twilioNumber = await provisionPhoneNumber();
  } catch (err) {
    console.error("Twilio provisioning failed:", err);
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const defaultTimezone =
    market === "pk" ? "Asia/Karachi" : "America/New_York";

  const { data: business, error } = await supabase
    .from("businesses")
    .insert({
      owner_user_id: user.id,
      name: name.trim(),
      industry: industry ?? null,
      market,
      forwarding_number: normalizedForwarding,
      whatsapp_number: normalizedWhatsapp,
      missed_call_voice_message:
        missed_call_voice_message?.trim() || DEFAULT_VOICE_MESSAGE,
      timezone: timezone ?? defaultTimezone,
      business_hours: (business_hours ?? null) as Json,
      twilio_number: twilioNumber,
      trial_ends_at: trialEndsAt.toISOString(),
      subscription_status: "trialing",
      // PK track skips caller-ID verification — passthrough marks onboarding complete
      caller_id_mode: market === "pk" ? "passthrough" : "unknown",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const wa_me_link = normalizedWhatsapp
    ? buildWaMeLink(normalizedWhatsapp)
    : null;

  return NextResponse.json({
    business,
    twilio_number: twilioNumber,
    wa_me_link,
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: current } = await supabase
    .from("businesses")
    .select("market")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  const market = (current?.market ?? "us") as Market;
  const phoneCountry = phoneCountryForMarket(market);

  const body = await request.json();
  const updates: BusinessUpdate = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.industry !== undefined) updates.industry = body.industry;
  if (body.timezone !== undefined) updates.timezone = body.timezone;
  if (body.business_hours !== undefined)
    updates.business_hours = body.business_hours as Json;
  if (body.message_template !== undefined)
    updates.message_template = body.message_template;
  if (body.missed_call_voice_message !== undefined)
    updates.missed_call_voice_message = body.missed_call_voice_message;

  if (body.forwarding_number !== undefined) {
    const normalized = formatPhone(body.forwarding_number, phoneCountry);
    if (!normalized) {
      return NextResponse.json(
        { error: "Invalid forwarding phone number" },
        { status: 400 },
      );
    }
    updates.forwarding_number = normalized;
  }

  if (body.whatsapp_number !== undefined) {
    const normalized = formatPhone(body.whatsapp_number, "PK");
    if (!normalized) {
      return NextResponse.json(
        { error: "Invalid WhatsApp number" },
        { status: 400 },
      );
    }
    updates.whatsapp_number = normalized;
  }

  if (body.caller_id_mode !== undefined) {
    const validModes = ["passthrough", "anonymous", "unknown"];
    if (!validModes.includes(body.caller_id_mode)) {
      return NextResponse.json(
        { error: "Invalid caller_id_mode" },
        { status: 400 },
      );
    }
    updates.caller_id_mode = body.caller_id_mode;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("owner_user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const wa_me_link = business.whatsapp_number
    ? buildWaMeLink(business.whatsapp_number)
    : null;

  return NextResponse.json({ business, wa_me_link });
}
