import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PaddleInlineCheckout } from "@/components/billing/PaddleInlineCheckout";
import type { Business } from "@/lib/supabase/types";

export default async function BillingCheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("businesses")
    .select("id, paddle_subscription_id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  const business = data as Pick<Business, "id" | "paddle_subscription_id"> | null;
  if (!business) redirect("/onboarding");

  if (business.paddle_subscription_id) {
    redirect("/settings/billing");
  }

  return (
    <PaddleInlineCheckout
      businessId={business.id}
      customerEmail={user.email}
    />
  );
}
