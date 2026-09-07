type MockFrameProps = {
  className?: string;
  title: string;
  badge?: string;
  footer?: string;
  children: React.ReactNode;
};

/** Shared white UI panel + soft glow — matches ChatCard look. */
export function MockFrame({
  className = "",
  title,
  badge,
  footer,
  children,
}: MockFrameProps) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-400/25 via-indigo-400/20 to-violet-500/25 blur-2xl animate-pulse-soft"
      />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white text-slate-900 shadow-[0_20px_50px_-20px_rgba(79,70,229,0.35)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-xs font-medium text-slate-500">{title}</span>
          {badge ? (
            <span className="text-xs font-medium text-indigo-500">{badge}</span>
          ) : null}
        </div>
        <div className="p-4">{children}</div>
        {footer ? (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
