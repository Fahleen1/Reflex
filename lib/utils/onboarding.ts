import type { Business } from "@/lib/supabase/types";

/**
 * Whether the owner finished the onboarding wizard enough to use the dashboard.
 * US: has a business with forwarding number (caller_id_mode may be reset later for re-test).
 * PK: has WhatsApp number configured.
 */
export function isOnboardingComplete(
  business: Pick<
    Business,
    "market" | "forwarding_number" | "whatsapp_number"
  > | null,
): boolean {
  if (!business) return false;
  if (business.market === "pk") {
    return !!business.whatsapp_number;
  }
  return !!business.forwarding_number;
}
