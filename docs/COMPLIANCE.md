# SMS & Telephony Compliance (US — Track A)

> **Start A2P 10DLC registration in parallel with Module 1** — approval can take days and is often the critical path for launch.

> **Pakistan-track businesses (`market = 'pk'`) do not use SMS.** See [PAKISTAN_TRACK.md](./PAKISTAN_TRACK.md) instead.

## A2P 10DLC Registration

Before reliably sending SMS to US numbers at volume, register a **Brand** and **Campaign** with The Campaign Registry via Twilio.

- Campaign type: "mixed/conversational" or "customer care"
- Unregistered traffic gets throttled/filtered by carriers
- Register as platform/reseller if operating from outside the US

### Checklist

- [ ] Submit Brand registration in Twilio Console
- [ ] Submit Campaign registration (missed-call auto-text use case)
- [ ] Wait for approval (same-day to several business days)
- [ ] Verify messaging works on approved campaign before launch

## TCPA / Consent

Auto-texting after a missed call is generally defensible as responding to a communication the caller initiated, but guardrails are required:

- Handle **STOP / UNSUBSCRIBE / CANCEL** and **HELP** keywords (Module 4)
- Once opted out, **never auto-text again** until `START`/`UNSTOP`
- Show consent notice during US onboarding (implemented in Module 2)
- Link privacy policy on marketing site: `/privacy`

## Message Content

- Keep auto-text transactional/conversational only
- Avoid promotional language in the automatic first text
- Marketing/follow-up sequences require separate opt-in campaign (v1.1+)

## Module 3 Gate (US track only)

Do **not** ship Module 3 voice webhook SMS logic for `market = 'us'` without:

1. Opt-out handling wired up (Module 4, or minimum STOP in webhook)
2. A2P 10DLC campaign approved (or accept filtered messages during testing)
3. Consent notice shown during US onboarding

## References

- [Twilio A2P 10DLC](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc)
- [TCPA Overview (FCC)](https://www.fcc.gov/consumers/guides/stop-unwanted-robocalls-and-texts)
