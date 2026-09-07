export function WaveBg({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id="reflex-waves"
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 60 Q30 40 60 60 T120 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
          />
          <path
            d="M0 80 Q30 60 60 80 T120 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
          />
          <path
            d="M0 40 Q30 20 60 40 T120 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#reflex-waves)" />
    </svg>
  );
}

export function MeshGradient({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute -left-1/4 top-0 h-[70%] w-[70%] rounded-full bg-sky-300/40 blur-3xl animate-mesh-drift" />
      <div className="absolute -right-1/4 top-1/4 h-[60%] w-[60%] rounded-full bg-violet-400/35 blur-3xl animate-mesh-drift-delay" />
      <div className="absolute bottom-0 left-1/3 h-[50%] w-[50%] rounded-full bg-indigo-300/30 blur-3xl animate-pulse-soft" />
    </div>
  );
}
