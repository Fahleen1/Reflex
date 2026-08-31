# CallBack — Missed Call Text-Back SaaS

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

## Project status (Modules 1–2 vs spec v3.2)

| Module | Status | Notes |
|--------|--------|-------|
| **1** Setup & Auth | ✅ Done | Next.js, Supabase auth (email + Google), middleware, RLS, `docs/COMPLIANCE.md` |
| **2** Onboarding | ✅ Done | Dual-track wizard (`market` US/PK), caller-ID test (US), WhatsApp + voice message (PK), `wa.me` link |
| **3** Voice webhook | 🔲 Pending | Must branch on `market` — SMS for US, `<Say>` for PK |
| **4** SMS inbox | 🔲 Pending | US only; PK nav shows WhatsApp info instead |
| **5** Settings | 🔲 Partial | Read-only profile view; full edit in Module 5 |
| **6** Billing | 🔲 Pending | Paddle |
| **7** Marketing | 🔲 Partial | Landing, pricing, privacy exist; SEO/demo polish pending |

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
- [ ] **Manual:** US test call to confirm `caller_id_mode` before Module 3

### Not yet built (deferred to later modules)

- `settings/number`, `settings/billing` pages
- `lib/twilio/signature.ts`, `templates.ts`, `lib/utils/rateLimiting.ts`
- `supabase/seed.sql`
- Sentry, Resend, Paddle integration

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
