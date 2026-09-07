"use client";

import Link from "next/link";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";

export interface ConversationSummary {
  id: string;
  caller_number: string;
  last_message_at: string | null;
  status: string;
  opted_out: boolean;
  preview: string | null;
}

interface ConversationListProps {
  conversations: ConversationSummary[];
  selectedId?: string;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ConversationList({
  conversations,
  selectedId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        No conversations yet. They&apos;ll appear when customers reply to your
        missed-call texts.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <ul className="divide-y divide-gray-100">
        {conversations.map((conversation) => {
          const active = conversation.id === selectedId;
          return (
            <li key={conversation.id}>
              <Link
                href={`/inbox?c=${conversation.id}`}
                className={`block px-4 py-3 transition-colors hover:bg-gray-50 ${
                  active ? "bg-slate-100" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">
                      {formatPhoneDisplay(conversation.caller_number)}
                    </p>
                    {conversation.preview && (
                      <p className="mt-0.5 truncate text-sm text-gray-500">
                        {conversation.preview}
                      </p>
                    )}
                    {conversation.opted_out && (
                      <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                        Opted out
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatRelative(conversation.last_message_at)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
