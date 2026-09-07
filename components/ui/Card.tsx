import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function Card({
  children,
  className = "",
  title,
  description,
}: CardProps) {
  return (
    <div
      className={`rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_-28px_rgba(79,70,229,0.25)] sm:p-8 ${className}`}
    >
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h3 className="text-lg font-bold tracking-tight text-slate-950">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
