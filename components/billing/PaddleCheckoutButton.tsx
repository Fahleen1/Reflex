"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface PaddleCheckoutButtonProps {
  businessId: string;
  customerEmail?: string | null;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onCheckoutCompleted?: () => void;
}

export function PaddleCheckoutButton({
  label = "Start 14-day free trial",
  size = "md",
  className = "",
  onCheckoutCompleted,
}: PaddleCheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const configured = !!(
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN &&
    process.env.NEXT_PUBLIC_PADDLE_PRICE_ID
  );

  function handleCheckout() {
    setLoading(true);
    onCheckoutCompleted?.();
    router.push("/settings/billing/checkout");
  }

  if (!configured) {
    return (
      <div className="space-y-2">
        <Button size={size} className={className} disabled>
          {label}
        </Button>
        <p className="text-xs text-amber-700">
          Billing is not configured yet. Set{" "}
          <code className="rounded bg-amber-100 px-1">
            NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
          </code>{" "}
          and{" "}
          <code className="rounded bg-amber-100 px-1">
            NEXT_PUBLIC_PADDLE_PRICE_ID
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <Button
      size={size}
      className={className}
      loading={loading}
      onClick={handleCheckout}
    >
      {label}
    </Button>
  );
}
