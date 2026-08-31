export const MARKETS = [
  {
    value: "us" as const,
    label: "United States",
    description: "Missed calls trigger an automatic SMS to the caller (Track A).",
  },
  {
    value: "pk" as const,
    label: "Pakistan",
    description:
      "Missed calls play a voice message pointing callers to WhatsApp (Track B). No SMS.",
  },
];

export const PK_TIMEZONES = [
  { value: "Asia/Karachi", label: "Pakistan (PKT)" },
] as const;

export const DEFAULT_VOICE_MESSAGE =
  "Sorry we couldn't take your call. Please message us on WhatsApp and we'll get right back to you.";

export const DEFAULT_BUSINESS_HOURS = {
  mon: { open: "09:00", close: "17:00" },
  tue: { open: "09:00", close: "17:00" },
  wed: { open: "09:00", close: "17:00" },
  thu: { open: "09:00", close: "17:00" },
  fri: { open: "09:00", close: "17:00" },
  sat: { open: "09:00", close: "13:00", closed: true },
  sun: { open: "09:00", close: "13:00", closed: true },
} as const;

export const INDUSTRIES = [
  { value: "plumber", label: "Plumbing" },
  { value: "hvac", label: "HVAC" },
  { value: "salon", label: "Salon / Barbershop" },
  { value: "detailer", label: "Auto Detailing" },
  { value: "electrician", label: "Electrical" },
  { value: "landscaping", label: "Landscaping" },
  { value: "cleaning", label: "Cleaning Services" },
  { value: "other", label: "Other" },
] as const;

export const US_TIMEZONES = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Anchorage", label: "Alaska (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HT)" },
] as const;

export const CALLER_ID_MODES = [
  {
    value: "passthrough" as const,
    label: "Real caller number visible",
    description:
      "Your webhook receives the actual caller's phone number. Auto-text will work.",
  },
  {
    value: "anonymous" as const,
    label: "Anonymous or blocked caller ID",
    description:
      "The caller ID is blank or shows as anonymous. Auto-text cannot be sent.",
  },
  {
    value: "unknown" as const,
    label: "Shows your own business number",
    description:
      "Carrier forwarding replaced the caller ID with your number. Auto-text cannot identify the caller.",
  },
];

export const CONSENT_NOTICE =
  "By using this service, you agree that your customers may receive an automated text message after a missed call to your business number. Customers can reply STOP at any time to opt out.";

export const DAYS_OF_WEEK = [
  { key: "mon" as const, label: "Monday" },
  { key: "tue" as const, label: "Tuesday" },
  { key: "wed" as const, label: "Wednesday" },
  { key: "thu" as const, label: "Thursday" },
  { key: "fri" as const, label: "Friday" },
  { key: "sat" as const, label: "Saturday" },
  { key: "sun" as const, label: "Sunday" },
];
