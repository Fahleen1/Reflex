import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/dashboard/OnboardingWizard";
import { isOnboardingComplete } from "@/lib/utils/onboarding";
import type { Business, Market } from "@/lib/supabase/types";

export default async function OnboardingPage() {
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

  if (business && isOnboardingComplete(business)) {
    if (
      business.market === "us" &&
      business.caller_id_mode === "unknown"
    ) {
      redirect("/settings/number");
    }
    redirect("/dashboard");
  }

  let initialStep: 1 | 2 | 3 | 4 | 5 = 1;
  if (business) {
    if (business.market === "pk") {
      initialStep = business.whatsapp_number ? 5 : 3;
    } else {
      initialStep = 4;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Set up your business
        </h1>
        <p className="mt-1 text-gray-600">
          Complete these steps to start capturing missed-call leads.
        </p>
      </div>
      <OnboardingWizard
        initialStep={initialStep}
        initialTwilioNumber={business?.twilio_number ?? null}
        initialMarket={(business?.market ?? "us") as Market}
        initialBusinessId={business?.id ?? null}
        customerEmail={user.email}
      />
    </div>
  );
}
