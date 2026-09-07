import { Card } from "@/components/ui/Card";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";
import type { CallStatus, Market } from "@/lib/supabase/types";

export interface CallLogEntry {
  id: string;
  caller_number: string | null;
  status: CallStatus | null;
  auto_text_sent: boolean;
  auto_text_skipped_reason: string | null;
  created_at: string;
}

interface CallLogTableProps {
  calls: CallLogEntry[];
  market: Market;
}

const SKIP_REASON_LABELS: Record<string, string> = {
  caller_id_unavailable:
    "Caller ID unavailable — auto-text could not identify the caller. Consider advertising your CallBack number directly instead of carrier forwarding.",
  opted_out: "Caller opted out of automated messages.",
  cooldown_active: "Skipped — caller was already auto-texted within the last 30 minutes.",
};

function formatStatus(status: CallStatus | null): string {
  if (!status) return "Pending";
  return status.replace(/-/g, " ");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CallLogTable({ calls, market }: CallLogTableProps) {
  const isPk = market === "pk";

  if (calls.length === 0) {
    return (
      <Card
        title="Recent calls"
        description={
          isPk
            ? "Calls will appear here once your Twilio number receives inbound calls."
            : "Calls will appear here once your Twilio number receives inbound calls."
        }
      >
        <p className="text-sm text-gray-500">No calls yet.</p>
      </Card>
    );
  }

  return (
    <Card title="Recent calls" description="Last 20 inbound calls to your business number.">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="pb-2 pr-4 font-medium">When</th>
              <th className="pb-2 pr-4 font-medium">Caller</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 font-medium">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {calls.map((call) => {
              const skipHint = call.auto_text_skipped_reason
                ? SKIP_REASON_LABELS[call.auto_text_skipped_reason]
                : null;

              let outcome: string;
              if (isPk) {
                outcome =
                  call.status && ["no-answer", "busy", "failed"].includes(call.status)
                    ? "Voice announcement played"
                    : call.status === "completed"
                      ? "Answered"
                      : "—";
              } else if (call.auto_text_sent) {
                outcome = "Auto-text sent";
              } else if (call.auto_text_skipped_reason) {
                outcome = call.auto_text_skipped_reason.replace(/_/g, " ");
              } else if (call.status === "completed") {
                outcome = "Answered — no text";
              } else {
                outcome = "—";
              }

              return (
                <tr key={call.id}>
                  <td className="py-3 pr-4 text-gray-600">
                    {formatDate(call.created_at)}
                  </td>
                  <td className="py-3 pr-4 text-gray-900">
                    {call.caller_number
                      ? formatPhoneDisplay(call.caller_number)
                      : "Unknown"}
                  </td>
                  <td className="py-3 pr-4 capitalize text-gray-600">
                    {formatStatus(call.status)}
                  </td>
                  <td className="py-3">
                    <span
                      className={
                        call.auto_text_skipped_reason === "caller_id_unavailable"
                          ? "font-medium text-amber-700"
                          : "text-gray-700"
                      }
                    >
                      {outcome}
                    </span>
                    {skipHint && (
                      <p className="mt-1 max-w-md text-xs text-amber-700">
                        {skipHint}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
