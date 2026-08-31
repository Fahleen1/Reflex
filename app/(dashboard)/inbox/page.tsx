import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { WhatsAppInfoCard } from "@/components/dashboard/WhatsAppInfoCard";
import type { Business } from "@/lib/supabase/types";

export default async function InboxPage() {
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

  if (business.market === "pk") {
    if (!business.whatsapp_number) redirect("/onboarding");

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
          <p className="mt-1 text-gray-600">
            Customers message you directly on WhatsApp. Replies happen in your
            WhatsApp app — there is no inbox here for Pakistan-track businesses.
          </p>
        </div>
        <WhatsAppInfoCard
          whatsappNumber={business.whatsapp_number}
          voiceMessage={business.missed_call_voice_message}
          twilioNumber={business.twilio_number}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <p className="mt-1 text-gray-600">
          SMS conversations will appear here once Module 4 is built.
        </p>
      </div>
      <Card>
        <p className="text-sm text-gray-500">No conversations yet.</p>
      </Card>
    </div>
  );
}
