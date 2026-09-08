import Link from "next/link";

type LogoSize = "sm" | "md" | "lg";

const sizeConfig: Record<
  LogoSize,
  { img: string; wrap: string }
> = {
  sm: {
    img: "h-[22px] w-auto max-w-[120px] object-contain object-left",
    wrap: "rounded-md px-2 py-1",
  },
  md: {
    img: "h-[28px] w-auto max-w-[150px] object-contain object-left",
    wrap: "rounded-lg px-2.5 py-1.5",
  },
  lg: {
    img: "h-[34px] w-auto max-w-[180px] object-contain object-left",
    wrap: "rounded-lg px-3 py-2",
  },
};

interface LogoProps {
  size?: LogoSize;
  href?: string | null;
  className?: string;
}

export function Logo({
  size = "sm",
  href = "/",
  className = "",
  priority = false,
}: LogoProps & { priority?: boolean }) {
  const { img, wrap } = sizeConfig[size];

  const content = (
    <span
      className={`inline-flex shrink-0 items-center ${wrap} ${className}`.trim()}
    >
      <img
        src="/logo.png"
        alt="Reflex"
        width={2172}
        height={724}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        className={img}
      />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {content}
      </Link>
    );
  }

  return content;
}
