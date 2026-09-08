import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsNav } from "@/components/dashboard/SettingsNav";
import { BillingStatusCard } from "@/components/billing/BillingStatusCard";
import { isMockTelephonyEnabled } from "@/lib/telephony/config";
import type { Business } from "@/lib/supabase/types";

interface BillingPageProps {
  searchParams: Promise<{ checkout?: string; reason?: string }>;
}

export default async function BillingSettingsPage({
  searchParams,
}: BillingPageProps) {
  const { checkout, reason } = await searchParams;
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
          Manage your subscription and billing.
        </p>
      </div>
      <SettingsNav showSimulator={isMockTelephonyEnabled()} />
      <BillingStatusCard
        business={business}
        customerEmail={user.email}
        checkoutSuccess={checkout === "success"}
        blockedReason={reason === "subscription"}
      />
    </div>
  );
}
