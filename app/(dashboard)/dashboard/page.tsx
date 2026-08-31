import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WhatsAppInfoCard } from "@/components/dashboard/WhatsAppInfoCard";
import type { Business } from "@/lib/supabase/types";

function isOnboardingComplete(business: Business): boolean {
  if (business.market === "pk") {
    return !!business.whatsapp_number;
  }
  return business.caller_id_mode !== "unknown";
}

export default async function DashboardPage() {
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

  if (!business || !isOnboardingComplete(business)) {
    redirect("/onboarding");
  }

  const isPk = business.market === "pk";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {business.name}
        </h1>
        <p className="mt-1 text-gray-600">
          {isPk
            ? "Missed calls play a voice message pointing callers to WhatsApp."
            : "Here's an overview of your missed-call activity."}
        </p>
      </div>

      {isPk && business.whatsapp_number && (
        <WhatsAppInfoCard
          whatsappNumber={business.whatsapp_number}
          voiceMessage={business.missed_call_voice_message}
          twilioNumber={business.twilio_number}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Missed calls this week", value: "—" },
          ...(isPk
            ? [{ label: "Voice announcements played", value: "—" }]
            : [
                { label: "Open conversations", value: "—" },
                { label: "Auto-texts sent", value: "—" },
              ]),
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <Card
        title="Recent calls"
        description="Call log will populate once Twilio voice webhooks are connected (Module 3)."
      >
        <p className="text-sm text-gray-500">No calls yet.</p>
      </Card>

      <div className="flex gap-3">
        {!isPk && (
          <Link href="/inbox">
            <Button variant="secondary">View inbox</Button>
          </Link>
        )}
        <Link href="/settings/business">
          <Button variant={isPk ? "secondary" : "ghost"}>
            Business settings
          </Button>
        </Link>
      </div>
    </div>
  );
}
