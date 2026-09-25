# Reflex

**Never lose a missed-call lead.** Reflex helps local service businesses (plumbers, salons, HVAC, detailers, and similar) recover conversations when they cannot answer the phone.

When a call goes unanswered, Reflex reacts automatically so the caller is not lost to the next listing on Google. How that works depends on the business market:

| | **United States** | **Pakistan** |
|---|---|---|
| **After a missed call** | Sends an automatic SMS to the caller | Plays a short voice message with your WhatsApp number |
| **Customer replies** | SMS thread in the Reflex dashboard | Customer messages you on WhatsApp (in your WhatsApp app) |
| **Telephony** | Twilio Voice + Messaging | Twilio Voice only (no SMS in Pakistan) |
| **Compliance notes** | [docs/COMPLIANCE.md](docs/COMPLIANCE.md) (A2P 10DLC, STOP/HELP) | [docs/PAKISTAN_TRACK.md](docs/PAKISTAN_TRACK.md) (customer-initiated WhatsApp) |

Both tracks share the same app: auth, onboarding, call log, settings, and subscription billing (Paddle, 14-day trial).

---

## What you get

- **Marketing site** — landing, pricing, privacy
- **Auth** — email/password and Google (Supabase)
- **Onboarding** — choose US or Pakistan, business profile, phone/WhatsApp setup
- **Dashboard** — recent calls, stats, market-specific inbox or WhatsApp info
- **US inbox** — two-way SMS, opt-out keywords (STOP/HELP/START), owner email alerts (Resend)
- **Billing** — Paddle checkout, webhooks, subscription gating
- **Local simulator** — test missed calls and (US) mock SMS without Twilio charges

For architecture and product rules, see [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md).

---

## Tech stack

- **App:** Next.js (App Router), TypeScript, Tailwind CSS
- **Database & auth:** Supabase (PostgreSQL + RLS)
- **Telephony:** Twilio Voice; Messaging for US SMS
- **Billing:** Paddle
- **Email:** Resend (optional, for reply alerts)

---

## Prerequisites

- Node.js 20+ (recommended for Next.js 16)
- A [Supabase](https://supabase.com) project
- [Twilio](https://twilio.com) account for live voice/SMS (optional if using mock telephony locally)
- [Paddle](https://paddle.com) sandbox for billing (optional locally — gating is off until Paddle env vars are set)

---

## Local setup

### 1. Install and configure env

```bash
git clone <your-repo-url>
cd Reflex
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`. Minimum to run the app and sign in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
TELEPHONY_PROVIDER=mock
```

Use the Supabase **project URL** (no `/rest/v1/` suffix).

### 2. Database migrations

Run these in order in the Supabase **SQL Editor** (or `supabase db push` if you use the CLI):

1. `supabase/migrations/20250831000000_initial_schema.sql`
2. `supabase/migrations/20250831120000_v3_pakistan_track.sql`
3. `supabase/migrations/20250901120000_module4_inbox_rls.sql`

### 3. Google sign-in (optional)

**Google Cloud Console** → OAuth client (Web application):

- **Authorized JavaScript origins:** `http://localhost:3000` (and your production URL later)
- **Authorized redirect URIs:** `https://YOUR_PROJECT.supabase.co/auth/v1/callback`  
  (Not your app URL — Supabase receives Google’s redirect first.)

**Supabase** → Authentication:

- **Providers → Google:** enable, paste Client ID and Secret
- **URL configuration:**
  - **Site URL:** `http://localhost:3000` (or production URL)
  - **Redirect URLs:** add  
    `http://localhost:3000/**`  
    and your production `https://your-domain/**`

The app completes login at `/api/auth/callback`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/webhooks only — never expose to the browser |
| `NEXT_PUBLIC_APP_URL` | Public app URL (no trailing slash); used for Twilio/Paddle webhooks |
| `TELEPHONY_PROVIDER` | `mock` (local, free) or `twilio` (live) |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Live telephony |
| `TWILIO_MESSAGING_SERVICE_SID` | US outbound SMS (requires A2P 10DLC) |
| `PADDLE_*` / `NEXT_PUBLIC_PADDLE_*` | Billing; see below |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Optional owner alerts on new SMS replies |

Full template: [.env.local.example](.env.local.example).

---

## Mock telephony (recommended for local dev)

```env
TELEPHONY_PROVIDER=mock
```

- No Twilio charges; outbound SMS uses simulated SIDs
- **Settings → Simulator** — missed/answered calls; US track can simulate replies and delivery failures
- Switch to `TELEPHONY_PROVIDER=twilio` and set Twilio credentials for real calls

---

## Live Twilio (voice and US SMS)

Twilio must reach your app over **HTTPS**. For local testing, use [ngrok](https://ngrok.com) or deploy first.

1. Set `NEXT_PUBLIC_APP_URL` to your public URL (e.g. `https://abc123.ngrok-free.app`).
2. Set `TELEPHONY_PROVIDER=twilio` and Twilio credentials.
3. **Phone number → Voice:** webhook `{NEXT_PUBLIC_APP_URL}/api/twilio/voice` (POST).
4. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (webhooks use the service role).
5. Place a test call; check Twilio Debugger and **Dashboard → Recent calls**.

US **SMS auto-text** also needs `TWILIO_MESSAGING_SERVICE_SID` and [A2P 10DLC](docs/COMPLIANCE.md) approval. Voice and call logging work without 10DLC.

**Pakistan:** voice + missed-call announcement only; no SMS. Customers reach you via WhatsApp after the voice prompt.

---

## Paddle billing

1. Create a Paddle **sandbox** product with a monthly price and **14-day trial**.
2. **Checkout → Checkout settings:** set **Default payment link** to your app URL (e.g. `http://localhost:3000`).  
   Sandbox: [checkout settings](https://sandbox-vendors.paddle.com/checkout-settings).
3. Add to `.env.local`:

   ```env
   PADDLE_API_KEY=...
   PADDLE_WEBHOOK_SECRET=...
   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
   NEXT_PUBLIC_PADDLE_PRICE_ID=pri_...
   NEXT_PUBLIC_PADDLE_ENV=sandbox
   ```

4. **Developer Tools → Notifications:** webhook `{NEXT_PUBLIC_APP_URL}/api/paddle/webhook`  
   Events: `subscription.created`, `subscription.updated`, `subscription.canceled`, `subscription.past_due`.
5. Webhook **secret** must match `PADDLE_WEBHOOK_SECRET` in env (restart the app after changes).

Until Paddle env vars are set, subscription gating is **disabled** so you can develop without checkout.

---

## Deploying (Netlify)

This app is **Next.js with server routes and API handlers**, not a static export.

- **Framework preset:** Next.js  
- **Build command:** `npm run build`  
- **Publish directory:** leave empty (do not use `public` or `.next` alone)  
- **Node:** 20+  
- Set the same env vars as production in Netlify, especially `NEXT_PUBLIC_APP_URL` and Supabase keys  
- Update Supabase **Site URL** and **Redirect URLs** for your Netlify domain  
- Optional: add `@netlify/plugin-nextjs` via `netlify.toml` if auto-detection fails  

Run `npm run build` locally before pushing; fix any TypeScript errors the build reports.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |

---

## Documentation

| File | Purpose |
|------|---------|
| [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md) | Full product and technical spec |
| [docs/COMPLIANCE.md](docs/COMPLIANCE.md) | US SMS, TCPA, A2P 10DLC |
| [docs/PAKISTAN_TRACK.md](docs/PAKISTAN_TRACK.md) | Pakistan WhatsApp-pointer flow |

---

## License

Private — all rights reserved.
