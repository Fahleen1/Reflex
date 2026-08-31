import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";
import { buildWaMeLink } from "@/lib/utils/waMeLink";
import type { Business } from "@/lib/supabase/types";

export default async function BusinessSettingsPage() {
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

  const isPk = business.market === "pk";
  const waMeLink = business.whatsapp_number
    ? buildWaMeLink(business.whatsapp_number)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business settings</h1>
        <p className="mt-1 text-gray-600">
          Full editing will be available in Module 5.
        </p>
      </div>

      <Card title="Business profile">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Name</dt>
            <dd className="text-gray-900">{business.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Market</dt>
            <dd className="text-gray-900">
              {business.market === "pk" ? "Pakistan (Track B)" : "United States (Track A)"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Industry</dt>
            <dd className="text-gray-900">{business.industry ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Twilio number</dt>
            <dd className="text-gray-900">
              {business.twilio_number
                ? formatPhoneDisplay(business.twilio_number)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Forwarding number</dt>
            <dd className="text-gray-900">
              {business.forwarding_number
                ? formatPhoneDisplay(business.forwarding_number)
                : "—"}
            </dd>
          </div>
          {!isPk && (
            <>
              <div>
                <dt className="font-medium text-gray-500">Caller ID mode</dt>
                <dd className="text-gray-900">{business.caller_id_mode}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">SMS template</dt>
                <dd className="text-gray-900">{business.message_template}</dd>
              </div>
            </>
          )}
          {isPk && (
            <>
              <div>
                <dt className="font-medium text-gray-500">WhatsApp number</dt>
                <dd className="text-gray-900">
                  {business.whatsapp_number
                    ? formatPhoneDisplay(business.whatsapp_number)
                    : "—"}
                </dd>
              </div>
              {waMeLink && (
                <div>
                  <dt className="font-medium text-gray-500">WhatsApp link</dt>
                  <dd className="break-all text-blue-600">
                    <a href={waMeLink} target="_blank" rel="noopener noreferrer">
                      {waMeLink}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-medium text-gray-500">Voice announcement</dt>
                <dd className="text-gray-900">
                  {business.missed_call_voice_message}
                </dd>
              </div>
            </>
          )}
          <div>
            <dt className="font-medium text-gray-500">Timezone</dt>
            <dd className="text-gray-900">{business.timezone}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
