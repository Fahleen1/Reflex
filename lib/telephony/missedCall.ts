import { sendMissedCallAutoText } from "@/lib/twilio/autoText";
import { MISSED_CALL_STATUSES } from "@/lib/twilio/voice";
import type { Business } from "@/lib/supabase/types";

type MissedCallStatus = "no-answer" | "busy" | "failed";

export function isMissedCallStatus(
  status: string | null | undefined,
): status is MissedCallStatus {
  return (
    status !== null &&
    status !== undefined &&
    MISSED_CALL_STATUSES.has(status as MissedCallStatus)
  );
}

export async function handleUsMissedCallAutoText(
  business: Business,
  callId: string,
  callerNumber: string | null,
): Promise<void> {
  try {
    await sendMissedCallAutoText(business, callId, callerNumber);
  } catch (error) {
    console.error("Missed-call auto-text failed", error);
  }
}
