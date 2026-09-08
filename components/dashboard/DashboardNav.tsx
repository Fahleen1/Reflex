"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import type { Market } from "@/lib/supabase/types";

interface DashboardNavProps {
  market: Market | null;
}

export function DashboardNav({ market }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/dashboard", label: "Overview" },
    ...(market === "pk"
      ? [{ href: "/inbox", label: "WhatsApp" }]
      : [{ href: "/inbox", label: "Inbox" }]),
    { href: "/settings", label: "Settings" },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <Logo size="sm" href="/dashboard" />
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => {
              const active =
                item.href === "/settings"
                  ? pathname.startsWith("/settings")
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={
                    item.href === "/settings"
                      ? "/settings/business"
                      : item.href
                  }
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-950"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
