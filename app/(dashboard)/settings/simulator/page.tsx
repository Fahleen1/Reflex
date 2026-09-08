import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsNav } from "@/components/dashboard/SettingsNav";
import { TelephonySimulator } from "@/components/dashboard/TelephonySimulator";
import { isMockTelephonyEnabled } from "@/lib/telephony/config";
import type { Business } from "@/lib/supabase/types";

export default async function SimulatorSettingsPage() {
  if (!isMockTelephonyEnabled()) {
    notFound();
  }

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

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, caller_number")
    .eq("business_id", business.id)
    .order("last_message_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Telephony simulator
        </h1>
        <p className="mt-1 text-slate-600">
          Test missed-call logic without Twilio charges. Messages are marked as
          simulated.
        </p>
      </div>
      <SettingsNav showSimulator />
      <TelephonySimulator
        market={business.market}
        conversations={conversations ?? []}
      />
    </div>
  );
}
