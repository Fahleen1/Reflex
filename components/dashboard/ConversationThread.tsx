"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";
import { isSimulatedMessageSid } from "@/lib/telephony/config";

export interface ThreadMessage {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  delivery_status: string | null;
  created_at: string;
  message_sid?: string | null;
}

interface ConversationThreadProps {
  conversationId: string;
  callerNumber: string;
  optedOut: boolean;
  messages: ThreadMessage[];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ConversationThread({
  conversationId,
  callerNumber,
  optedOut,
  messages: initialMessages,
}: ConversationThreadProps) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || optedOut) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        body: reply.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to send message");
      setLoading(false);
      return;
    }

    setMessages((prev) => [...prev, data.message]);
    setReply("");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex h-full min-h-[480px] flex-col rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <p className="font-medium text-gray-900">
          {formatPhoneDisplay(callerNumber)}
        </p>
        {optedOut && (
          <p className="mt-1 text-xs text-amber-700">
            This caller opted out. They must text START before you can message
            them again.
          </p>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">No messages in this thread yet.</p>
        ) : (
          messages.map((message) => {
            const isOutbound = message.direction === "outbound";
            return (
              <div
                key={message.id}
                className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    isOutbound
                      ? "bg-slate-950 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.body}</p>
                  <p
                    className={`mt-1 text-xs ${
                      isOutbound ? "text-slate-200" : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.created_at)}
                    {isOutbound && message.delivery_status
                      ? ` · ${message.delivery_status}`
                      : ""}
                    {message.message_sid &&
                    isSimulatedMessageSid(message.message_sid)
                      ? " · simulated"
                      : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-gray-200 p-4"
      >
        {error && (
          <p className="mb-2 text-sm text-red-600">{error}</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={
              optedOut ? "Caller has opted out" : "Type your reply…"
            }
            disabled={optedOut || loading}
            className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50"
          />
          <Button type="submit" disabled={optedOut || loading || !reply.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
