import { MockFrame } from "@/components/marketing/MockFrame";

const flow = [
  {
    n: "1",
    title: "Number connected",
    detail: "Forwarding on · US track",
    done: true,
  },
  {
    n: "2",
    title: "Missed call detected",
    detail: "No answer · auto-SMS queued",
    done: true,
  },
  {
    n: "3",
    title: "Lead in your inbox",
    detail: "Reply when you're free",
    done: false,
  },
];

export function StepsCard({ className = "" }: { className?: string }) {
  return (
    <MockFrame
      className={className}
      title="Setup flow"
      badge="3 steps"
      footer="Live in minutes · no complex setup"
    >
      <ol className="space-y-3">
        {flow.map((step, i) => (
          <li
            key={step.n}
            className={`flex gap-3 rounded-2xl px-3 py-3 ${
              step.done
                ? "bg-slate-100"
                : "bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
            } ${i === 0 ? "animate-slide-in" : ""} ${
              i === 1 ? "animate-slide-in-delay" : ""
            } ${i === 2 ? "animate-slide-in-delay-2" : ""}`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step.done
                  ? "bg-slate-950 text-white"
                  : "bg-white/20 text-white"
              }`}
            >
              {step.done ? "✓" : step.n}
            </span>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  step.done ? "text-slate-900" : "text-white"
                }`}
              >
                {step.title}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  step.done ? "text-slate-500" : "text-white/80"
                }`}
              >
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </MockFrame>
  );
}
