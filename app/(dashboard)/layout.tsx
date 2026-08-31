import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import type { Business } from "@/lib/supabase/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("businesses")
    .select("market")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  const business = data as Pick<Business, "market"> | null;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav market={business?.market ?? null} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
