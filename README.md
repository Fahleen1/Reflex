# Reflex — Missed Call Text-Back SaaS

Never lose a missed call lead. Automatically reach callers when you can't pick up — via **SMS (US)** or **WhatsApp voice pointer (Pakistan)**.

> **Spec:** This project follows [PROJECT_SPEC v3.2](docs/PROJECT_SPEC.md) (dual-track: US SMS + Pakistan WhatsApp).

## Two parallel tracks (v3)

| | **Track A — US** | **Track B — Pakistan** |
|---|---|---|
| **Mechanic** | Auto-SMS after missed call | Voice announcement → `wa.me` WhatsApp link |
| **Telephony** | Twilio Voice + Messaging | Twilio Voice only (no SMS in PK) |
| **Replies** | Dashboard inbox (Module 4) | Owner's WhatsApp app (outside dashboard) |
| **Compliance** | A2P 10DLC + TCPA ([docs/COMPLIANCE.md](docs/COMPLIANCE.md)) | Customer-initiated WhatsApp ([docs/PAKISTAN_TRACK.md](docs/PAKISTAN_TRACK.md)) |
| **`businesses.market`** | `'us'` | `'pk'` |

Both tracks share auth, dashboard, billing (Paddle), and call logging.

## Getting started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) project
- [Twilio](https://twilio.com) account (voice for both tracks; messaging for US only)

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in Supabase URL and keys (Settings → API in Supabase dashboard).

3. **Run database migrations** (in order)

   ```text
   supabase/migrations/20250831000000_initial_schema.sql
   supabase/migrations/20250831120000_v3_pakistan_track.sql
   ```

   Paste into the Supabase SQL Editor, or use `supabase db push`.

4. **Enable Google OAuth** (optional)

   Supabase → Authentication → Providers → Google.  
   Redirect URL: `http://localhost:3000/api/auth/callback`

5. **Start dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Twilio

Add to `.env.local`:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=   # US SMS only (Module 3+)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- **US track:** Provisions a US local number during onboarding; start [A2P 10DLC registration](docs/COMPLIANCE.md) immediately — often the launch critical path.
- **Pakistan track:** Uses Twilio Voice for call detection only; no SMS provisioning needed.

## Project status (Modules 1–7 vs spec v3.2)

| Module | Status | Notes |
|--------|--------|-------|
| **1** Setup & Auth | ✅ Done | Next.js, Supabase auth (email + Google), middleware, RLS, `docs/COMPLIANCE.md` |
| **2** Onboarding | ✅ Done | Dual-track wizard (`market` US/PK), caller-ID test (US), WhatsApp + voice message (PK) |
| **3** Voice webhooks | ✅ Done | `/api/twilio/voice`, `/api/twilio/voice-status`, US auto-SMS + PK voice `<Say>`, call log on dashboard |
| **4** SMS inbox | ✅ Done | Inbound SMS webhook, STOP/HELP/START, inbox UI, owner email alerts, delivery status |
| **5** Settings | ✅ Done | Edit profile/hours/template, phone + caller-ID re-test, dashboard stats |
| **6** Billing | ✅ Done | Paddle checkout, webhooks, access gating, Settings → Billing |
| **7** Marketing | ✅ Done | Invofy-style landing (Reflex brand, blue–purple gradients, chat demo), pricing, privacy, SEO/OG |

### Testing Module 3 (Twilio voice webhooks)

Twilio must reach your app over HTTPS. For local dev, use [ngrok](https://ngrok.com) or deploy to Vercel first.

1. Set `NEXT_PUBLIC_APP_URL` to your public URL (e.g. `https://abc123.ngrok.io` — no trailing slash).
2. In **Twilio Console → Phone Numbers → your number → Voice**, set:
   - **A call comes in:** Webhook → `{NEXT_PUBLIC_APP_URL}/api/twilio/voice` (HTTP POST)
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (webhooks write via service role).
4. Call your Twilio number from another phone; don't answer the forwarded line (voicemail off).
5. Check **Twilio Debugger** for webhook requests and the dashboard **Recent calls** table.

**US SMS** also requires `TWILIO_MESSAGING_SERVICE_SID` and A2P 10DLC approval. Voice + call logging works without 10DLC.

### Paddle billing setup (Module 6)

1. Create a Paddle **sandbox** account and a product with a monthly price that includes a **14-day trial**.
2. Copy into `.env.local`:
   ```env
   PADDLE_API_KEY=...
   PADDLE_WEBHOOK_SECRET=...          # from Developer Tools → Notifications
   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
   NEXT_PUBLIC_PADDLE_PRICE_ID=pri_...
   NEXT_PUBLIC_PADDLE_ENV=sandbox
   ```
3. Add a notification destination webhook URL: `{NEXT_PUBLIC_APP_URL}/api/paddle/webhook`  
   Subscribe to `subscription.created`, `subscription.updated`, `subscription.canceled`, `subscription.past_due`.
4. Ensure the price’s checkout passes `custom_data.business_id` (the app sets this automatically).
5. Until these env vars are set, billing gating is **disabled** so local Module 1–5 testing still works.

### Module 1 checklist (spec)

- [x] Next.js + TypeScript + Tailwind
- [x] Supabase migrations + RLS from day one
- [x] Email + Google OAuth, auth-guarded dashboard
- [x] `docs/COMPLIANCE.md`
- [ ] **Manual:** Submit A2P 10DLC brand/campaign in Twilio (Track A only)

### Module 2 checklist (spec v3.2)

- [x] Market selection (`us` / `pk`)
- [x] **US:** forwarding number, business hours, timezone, SMS consent, Twilio number, caller-ID test
- [x] **PK:** WhatsApp number, voice message, `wa.me` link, skip caller-ID/SMS consent
- [x] Save to `businesses` (`market`, `whatsapp_number`, `missed_call_voice_message`)
- [x] Dashboard: hide SMS inbox for PK; show WhatsApp info card
- [ ] **Manual:** US test call to confirm `caller_id_mode` before relying on auto-text

### Module 6 checklist (spec v3.2)

- [x] Paddle checkout during onboarding (after business profile)
- [x] `/api/paddle/webhook` — signature verify, idempotent `billing_events`, subscription sync
- [x] Access gating via `subscription_status` + `paddle_subscription_id`
- [x] Settings → Billing (status, checkout, customer portal)
- [x] Pricing page notes Paddle trial
- [ ] **Manual:** Create Paddle sandbox product/price with 14-day trial; set env vars; point webhook to `{APP_URL}/api/paddle/webhook`

### Module 5 checklist (spec v3.2)

- [x] Edit business profile, hours, timezone
- [x] Edit SMS template (US) with `{business_name}` docs / voice + WhatsApp (PK)
- [x] Update forwarding number + re-trigger caller-ID verification (US)
- [x] Dashboard stats: missed calls, response rate, skipped/undelivered
- [x] Settings sub-nav: Business · Phone number

### Module 4 checklist (spec v3.2)

- [x] `/api/twilio/sms` — STOP/UNSUBSCRIBE/CANCEL, HELP, START/UNSTOP, inbound messages
- [x] `/api/twilio/sms-status` — delivery status updates
- [x] Dashboard inbox — conversation list, thread view, reply box
- [x] `POST /api/messages` — send reply via Twilio
- [x] Owner email alert on new inbound reply (Resend)
- [ ] **Manual:** Configure Resend domain + `RESEND_API_KEY` / `RESEND_FROM_EMAIL`

### Module 3 checklist (spec v3.2)

- [x] `/api/twilio/voice` — signature validation, call logging, Dial TwiML
- [x] `/api/twilio/voice-status` — market branch (US auto-SMS / PK voice `<Say>`)
- [x] ParentCallSid caller resolution, cooldown, opt-out, caller-ID guards (US)
- [x] Dashboard call log with skip reasons
- [ ] **Manual:** Configure Twilio voice webhook URL + end-to-end test call

### Module 7 checklist (spec v3.2)

- [x] Landing — headline, problem/solution, animated demo, CTA to trial
- [x] Pricing page (`/pricing`)
- [x] Privacy policy with SMS consent / STOP / HELP (`/privacy`)
- [x] Basic SEO — meta tags, Open Graph image (`/opengraph-image`)

### Not yet built (deferred)

- Sentry
- `supabase/seed.sql`
- Module 8 post-MVP nice-to-haves (see [PROJECT_SPEC](docs/PROJECT_SPEC.md))
## Docs

| File | Purpose |
|------|---------|
| [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md) | Authoritative spec (v3.2) |
| [docs/COMPLIANCE.md](docs/COMPLIANCE.md) | US SMS / A2P 10DLC / TCPA |
| [docs/PAKISTAN_TRACK.md](docs/PAKISTAN_TRACK.md) | Pakistan WhatsApp-pointer track (Section 2b) |

## Tech stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** PostgreSQL via Supabase (RLS enabled)
- **Auth:** Supabase Auth
- **Telephony:** Twilio Programmable Voice (+ Messaging for US)

## License

Private — all rights reserved.
