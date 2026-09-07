import { createServiceClient } from "@/lib/supabase/service";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";

interface NewReplyNotification {
  businessId: string;
  businessName: string;
  callerNumber: string;
  messagePreview: string;
}

export async function notifyOwnerOfNewReply({
  businessId,
  businessName,
  callerNumber,
  messagePreview,
}: NewReplyNotification): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn("Resend not configured — skipping owner alert email");
    return;
  }

  const supabase = createServiceClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("owner_user_id")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) return;

  const { data: ownerData, error: ownerError } =
    await supabase.auth.admin.getUserById(business.owner_user_id);

  if (ownerError || !ownerData.user.email) {
    console.error("Failed to resolve owner email for notification", ownerError);
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const inboxUrl = appUrl ? `${appUrl}/inbox` : "/inbox";
  const callerDisplay = formatPhoneDisplay(callerNumber);
  const preview =
    messagePreview.length > 200
      ? `${messagePreview.slice(0, 200)}…`
      : messagePreview;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: ownerData.user.email,
      subject: `New SMS reply — ${callerDisplay}`,
      html: `
        <p>You have a new SMS reply for <strong>${businessName}</strong>.</p>
        <p><strong>From:</strong> ${callerDisplay}</p>
        <p><strong>Message:</strong> ${preview.replace(/</g, "&lt;")}</p>
        <p><a href="${inboxUrl}">Open inbox</a></p>
      `,
    }),
  });

  if (!response.ok) {
    console.error("Resend API error", await response.text());
  }
}
