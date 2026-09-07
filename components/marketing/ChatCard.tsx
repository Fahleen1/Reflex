"use client";

type ChatCardProps = {
  className?: string;
  dark?: boolean;
};

export function ChatCard({ className = "", dark = false }: ChatCardProps) {
  const shell = dark
    ? "border-white/15 bg-[#102433] text-slate-100 shadow-2xl shadow-indigo-900/30"
    : "border-slate-200/80 bg-white text-slate-900 shadow-[0_20px_50px_-20px_rgba(79,70,229,0.35)]";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const inbound = dark ? "bg-slate-700/80 text-slate-100" : "bg-slate-100 text-slate-800";
  const outbound = dark
    ? "bg-indigo-500 text-white"
    : "bg-gradient-to-br from-indigo-500 to-violet-500 text-white";

  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-400/25 via-indigo-400/20 to-violet-500/25 blur-2xl animate-pulse-soft"
      />
      <div
        className={`relative overflow-hidden rounded-[1.75rem] border ${shell}`}
      >
        <div
          className={`flex items-center justify-between border-b px-4 py-3 ${
            dark ? "border-white/10" : "border-slate-100"
          }`}
        >
          <span className={`text-xs font-medium ${muted}`}>Missed call</span>
          <span className="text-xs font-medium text-indigo-500">just now</span>
        </div>
        <div className="space-y-3 p-4">
          <div
            className={`animate-slide-in rounded-2xl rounded-tl-sm px-4 py-3 text-sm ${inbound}`}
          >
            Incoming · (555) 014-2281
            <p className={`mt-1 text-xs ${muted}`}>No answer · 0:18</p>
          </div>
          <div
            className={`animate-slide-in-delay ml-auto max-w-[90%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm ${outbound}`}
          >
            Hi! Sorry we missed your call. What can we help you with today?
            <p
              className={`mt-1 text-xs ${
                dark ? "text-indigo-100/80" : "text-white/80"
              }`}
            >
              Auto-sent by Reflex
            </p>
          </div>
          <div
            className={`animate-slide-in-delay-2 rounded-2xl rounded-tl-sm px-4 py-3 text-sm ${inbound}`}
          >
            Can you come fix my AC this afternoon?
          </div>
        </div>
        <div
          className={`border-t px-4 py-3 text-center text-xs ${muted} ${
            dark ? "border-white/10 bg-black/20" : "border-slate-100 bg-slate-50"
          }`}
        >
          Lead captured · reply in your inbox
        </div>
      </div>
    </div>
  );
}
