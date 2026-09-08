import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsNav } from "@/components/dashboard/SettingsNav";
import { NumberSettingsForm } from "@/components/dashboard/NumberSettingsForm";
import { isMockTelephonyEnabled } from "@/lib/telephony/config";
import type { Business } from "@/lib/supabase/types";

export default async function NumberSettingsPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">
          Your Reflex number, forwarding target, and caller ID setup.
        </p>
      </div>
      <SettingsNav showSimulator={isMockTelephonyEnabled()} />
      <NumberSettingsForm business={business} />
    </div>
  );
}
