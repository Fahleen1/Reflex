"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface ConversationOption {
  id: string;
  caller_number: string;
}

interface TelephonySimulatorProps {
  market: "us" | "pk";
  conversations: ConversationOption[];
}

export function TelephonySimulator({
  market,
  conversations,
}: TelephonySimulatorProps) {
  const router = useRouter();
  const [callerNumber, setCallerNumber] = useState("+15550142281");
  const [replyBody, setReplyBody] = useState(
    "Can you come fix my AC this afternoon?",
  );
  const [conversationId, setConversationId] = useState(
    conversations[0]?.id ?? "",
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function simulate(
    action: string,
    url: string,
    payload: Record<string, unknown>,
  ) {
    setLoading(action);
    setError(null);
    setResult(null);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Simulation failed");
      setLoading(null);
      return;
    }

    setResult(JSON.stringify(data, null, 2));
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card
        title="Simulate missed call"
        description="Creates a call log entry. US track also runs auto-text logic (mock SMS — no carrier charges)."
      >
        <div className="space-y-4">
          <Input
            label="Caller number (E.164)"
            value={callerNumber}
            onChange={(e) => setCallerNumber(e.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              className="cursor-pointer"
              loading={loading === "missed"}
              disabled={!!loading}
              onClick={() =>
                simulate("missed", "/api/dev/simulate/missed-call", {
                  caller_number: callerNumber,
                  dial_status: "no-answer",
                })
              }
            >
              Missed call (no-answer)
            </Button>
            <Button
              variant="secondary"
              className="cursor-pointer"
              loading={loading === "answered"}
              disabled={!!loading}
              onClick={() =>
                simulate("answered", "/api/dev/simulate/missed-call", {
                  caller_number: callerNumber,
                  dial_status: "completed",
                })
              }
            >
              Answered call
            </Button>
          </div>
        </div>
      </Card>

      {market === "us" && (
        <>
          <Card
            title="Simulate customer reply"
            description="Adds an inbound message to a conversation (simulated)."
          >
            <div className="space-y-4">
              {conversations.length > 0 ? (
                <div className="space-y-1.5">
                  <label
                    htmlFor="sim-conversation"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Conversation
                  </label>
                  <select
                    id="sim-conversation"
                    value={conversationId}
                    onChange={(e) => setConversationId(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {conversations.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.caller_number}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Simulate a missed call first to create a conversation.
                </p>
              )}
              <Input
                label="Reply text"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
              />
              <Button
                className="cursor-pointer"
                loading={loading === "reply"}
                disabled={!!loading || !conversationId}
                onClick={() =>
                  simulate("reply", "/api/dev/simulate/inbound-reply", {
                    conversation_id: conversationId,
                    body: replyBody,
                  })
                }
              >
                Send simulated reply
              </Button>
            </div>
          </Card>

          <Card
            title="Simulate delivery failure"
            description="Marks the latest outbound message in the selected conversation as failed."
          >
            <Button
              variant="secondary"
              className="cursor-pointer"
              loading={loading === "fail"}
              disabled={!!loading || !conversationId}
              onClick={async () => {
                setLoading("fail");
                setError(null);
                setResult(null);
                const res = await fetch(
                  `/api/messages?conversation_id=${conversationId}`,
                );
                const data = await res.json();
                const outbound = (data.messages ?? [])
                  .filter(
                    (m: { direction: string }) => m.direction === "outbound",
                  )
                  .pop();
                if (!outbound?.id) {
                  setError("No outbound message in this conversation");
                  setLoading(null);
                  return;
                }
                await simulate(
                  "fail",
                  "/api/dev/simulate/delivery-failure",
                  { message_id: outbound.id },
                );
              }}
            >
              Mark latest outbound as failed
            </Button>
          </Card>
        </>
      )}

      {market === "pk" && (
        <Card title="Pakistan track">
          <p className="text-sm text-slate-600">
            Mock mode logs calls only. Voice <code>&lt;Say&gt;</code> and WhatsApp
            follow-up happen on live Twilio webhooks, not in the simulator.
          </p>
        </Card>
      )}

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {result && (
        <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
          {result}
        </pre>
      )}
    </div>
  );
}
