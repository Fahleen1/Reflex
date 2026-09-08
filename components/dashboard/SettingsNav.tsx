"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const settingsLinks = [
  { href: "/settings/business", label: "Business" },
  { href: "/settings/number", label: "Phone number" },
  { href: "/settings/billing", label: "Billing" },
];

interface SettingsNavProps {
  showSimulator?: boolean;
}

export function SettingsNav({ showSimulator = false }: SettingsNavProps) {
  const pathname = usePathname();

  const links = showSimulator
    ? [...settingsLinks, { href: "/settings/simulator", label: "Simulator" }]
    : settingsLinks;

  return (
    <nav className="flex gap-1 border-b border-gray-200 pb-px">
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-slate-950 text-slate-950"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
