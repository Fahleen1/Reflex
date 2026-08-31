import { parsePhoneNumberFromString } from "libphonenumber-js";

export type PhoneCountry = "US" | "PK";

/**
 * Normalize a phone number to E.164 format.
 * Defaults to US (+1) or PK (+92) based on defaultCountry.
 */
export function formatPhone(
  input: string,
  defaultCountry: PhoneCountry = "US",
): string | null {
  const parsed = parsePhoneNumberFromString(input, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    return null;
  }
  return parsed.format("E.164");
}

export function formatPhoneDisplay(e164: string): string {
  const parsed = parsePhoneNumberFromString(e164);
  if (!parsed) return e164;
  return parsed.formatNational();
}
