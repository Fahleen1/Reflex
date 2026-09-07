import { createHmac, timingSafeEqual } from "crypto";

const MAX_AGE_SECONDS = 300;

/**
 * Verify Paddle Billing webhook signature (Paddle-Signature header).
 * Must use the raw request body string — never re-serialized JSON.
 */
export function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;

  let ts = "";
  const h1Values: string[] = [];

  for (const part of signatureHeader.split(";")) {
    const [key, ...rest] = part.split("=");
    const value = rest.join("=");
    if (key === "ts") ts = value;
    if (key === "h1") h1Values.push(value);
  }

  if (!ts || h1Values.length === 0) return false;

  const age = Math.floor(Date.now() / 1000) - Number(ts);
  if (Number.isNaN(age) || age < 0 || age > MAX_AGE_SECONDS) {
    return false;
  }

  const signedPayload = `${ts}:${rawBody}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");

  return h1Values.some((h1) => {
    const actualBuf = Buffer.from(h1, "utf8");
    return (
      actualBuf.length === expectedBuf.length &&
      timingSafeEqual(actualBuf, expectedBuf)
    );
  });
}
