# Pakistan Track (Track B) — WhatsApp Pointer Flow

> Spec reference: PROJECT_SPEC v3.2, Section 2b

## Why this track exists

- Twilio does **not** support two-way SMS in Pakistan
- The official WhatsApp Business API adds cost and complexity before validation
- This track is the simplest thing that could work: **voice announcement + `wa.me` link**

## Core mechanic

1. Business phone forwards to a Twilio number (voice only — call detection)
2. On missed call → TwiML `<Say>` plays `missed_call_voice_message`
3. Caller is directed to message the business on WhatsApp
4. Business owner replies manually from their WhatsApp app (no API, no dashboard inbox)

## Opt-in safety

The customer **initiates** the WhatsApp conversation (via `wa.me` or by saving the number). There is no business-initiated WhatsApp message — no Meta template approval needed for v1.

## Database fields

| Column | Purpose |
|--------|---------|
| `market` | `'pk'` for this track |
| `whatsapp_number` | E.164 PK number → generates `wa.me` link |
| `missed_call_voice_message` | Text read aloud on no-answer |

## What we build in v1

- [x] Onboarding: WhatsApp number + voice message + `wa.me` link
- [x] Dashboard: WhatsApp info card (no SMS inbox)
- [x] Call log (Module 3 — calls still logged via voice webhook)
- [ ] Voice webhook `<Say>` branch for `market = 'pk'` (Module 3)

## What we explicitly do NOT build in v1

- WhatsApp Business API / Meta verification
- Automated WhatsApp replies or templates
- SMS to/from Pakistani numbers
- Unified WhatsApp inbox in dashboard

## Future upgrade path

Once validated, evaluate WhatsApp Business API or a no-code BSP (Wati, AiSensy) for automated first responses and analytics — not before.

## References

- [Twilio Pakistan guidelines](https://www.twilio.com/en-us/guidelines/pk/sms) (SMS not supported for two-way)
- [wa.me link format](https://faq.whatsapp.com/general/chats/how-to-use-click-to-chat)
