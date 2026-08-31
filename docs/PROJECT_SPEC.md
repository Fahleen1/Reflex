# Missed Call Text-Back SaaS — Project Specification (v3)

> v3 changes: added Section 2b — a lightweight, no-API "WhatsApp track" for the Pakistan market, run in parallel with the US SMS track, deliberately avoiding the official WhatsApp Business API (and its cost/compliance overhead) for v1. See changelog at bottom for the full v1→v2→v3 history.

## 1. Product Overview

**Problem:** Local service businesses (plumbers, HVAC, salons, detailers, etc.) miss phone calls constantly — when they do, the caller usually just calls the next business on Google. That's a lost lead, permanently.

**Solution:** A tool that detects a missed call to a business's tracked number and instantly auto-texts the caller (e.g. *"Hey, sorry we missed you! What can we help with?"*), so the lead stays warm. Replies land in a simple inbox the business owner can manage from their phone or a web dashboard.

**Target customer:** Single-location local service businesses. This spec now covers **two parallel go-to-market tracks**, chosen because the founder has real network/distribution advantage in Pakistan but the cleanest technical/compliance path runs through the US:

- **Track A — US (primary technical build):** SMS-based missed-call auto-text, as originally spec'd. Full Twilio + A2P 10DLC pipeline (Section 2a). This is the "real" product architecture and where most of Modules 1-7 below are aimed.
- **Track B — Pakistan (lightweight, low-complexity):** No SMS (Twilio does not support two-way SMS in Pakistan — confirmed via Twilio's own PK guidelines page), no official WhatsApp Business API (too costly/complex to justify before validation). Instead, a minimal "point people to WhatsApp" flow described in **Section 2b**. This track deliberately reuses as much of Track A's existing infrastructure (auth, dashboard, business profile) as possible and adds only what's strictly necessary.

Both tracks share the same Supabase schema, dashboard, and billing (Paddle). They differ only in how the "missed call → reach the customer" mechanic actually works, per business, based on a `country`/`market` field on the business record (see schema addendum in Section 2b).

**Pricing model:** Flat monthly subscription (~$29–79/mo equivalent, billed via Paddle), 14-day free trial, no long-term contract.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS | Dashboard + marketing site in one repo (monorepo optional but not required for v1) |
| Backend | Next.js API routes / Route Handlers | No separate backend service needed for v1 — keep it simple |
| Database | PostgreSQL via Supabase | Gives us DB + Auth + Realtime for free tier |
| Auth | Supabase Auth (email/password + Google OAuth) | Simple, no need for Clerk unless we want nicer UI later |
| Telephony/SMS | Twilio (Programmable Voice + Messaging) | Core of the product |
| Payments | Paddle (Merchant of Record) | Works from Pakistan, handles tax/invoicing, payouts via bank transfer |
| Hosting | Vercel (frontend + API routes) | Free tier sufficient for MVP |
| Background jobs | Vercel Cron / Supabase Edge Functions | For trial expiry checks; scheduled follow-ups deferred to v1.1 (see Module 8) |
| Transactional email | Resend or Supabase built-in SMTP | Onboarding emails, receipts, owner alerts on new replies |
| Error tracking | Sentry (free tier) | Catch production bugs early — add `SENTRY_DSN` to env vars |

---

## 2a. SMS & Telephony Compliance (US numbers) — READ BEFORE BUILDING MODULE 3

This is not optional if you're texting US phone numbers. Skipping it risks blocked messages, Twilio account suspension, or legal exposure.

**A2P 10DLC registration**
- Before you can reliably send SMS to US numbers at any real volume, you must register a **Brand** (your business entity) and a **Campaign** (this specific use case — "mixed/conversational" or "customer care" campaign type fits best) with The Campaign Registry, via Twilio's console/API.
- **Start this in parallel with Module 1**, not after the app is built — approval can take anywhere from same-day to several business days, and it is often the actual critical path for launch, not the coding.
- Unregistered traffic to US numbers gets throttled or filtered by carriers, especially at the volume of "every missed call."
- Since you're operating from Pakistan, you'll register as the platform/reseller if using Twilio's low-code campaign path, or your customer's business may need to be the registered brand depending on your Twilio account structure — confirm current requirements in the Twilio console when you start, since carrier rules shift.

**Consent (TCPA)**
- Auto-texting someone right after they called your customer's business is generally defensible as responding within an existing communication the caller initiated — but you still need real guardrails, not just an assumption:
  - Handle **STOP / UNSUBSCRIBE / CANCEL** and **HELP** as inbound keywords, per standard carrier requirements — Twilio's Advanced Opt-Out can handle this automatically if enabled; don't rely on it silently, log it into your own `opted_out` field too (see schema).
  - Once a number opts out, **never auto-text it again** for any business, until it opts back in (`START`/`UNSTOP`).
  - Show a short consent/notice line during business onboarding (e.g. "By using this service you agree your customers may receive an automated text after a missed call") and link a basic privacy policy on your marketing site before launch.

**Message content**
- Keep the auto-text purely transactional/conversational ("Sorry we missed your call, how can we help?") — avoid promotional language (discounts, offers) in the *automatic* first text, since that changes its compliance category and filtering risk.
- Any future marketing/follow-up sequences (review requests, promotions) are a **separate, explicit-opt-in feature** — do not bundle that into the missed-call auto-text campaign registration. Treat it as its own campaign if/when you build it.

**Action for the agent:** add a `docs/COMPLIANCE.md` stub during Module 1 with the above notes, and do not let Module 3 ship without opt-out handling wired up.

---

## 2b. Pakistan Track — Lightweight WhatsApp-Pointer Flow (no official API, no SMS)

**Why this track exists and why it looks different from Track A:** Twilio's own Pakistan guidelines confirm two-way SMS is not supported there, and domestic long-code numbers aren't available at all — so the entire SMS-based mechanic in Modules 3-4 simply cannot run for Pakistani businesses. Separately, the official WhatsApp Business API requires Meta Business verification, template approval, and per-message costs that aren't justified before you've validated demand. This track is intentionally the simplest thing that could plausibly work, not a scaled-down version of Track A.

**Core mechanic:**
1. Pakistani business's real phone number is used directly, OR forwarded through a Twilio number purely for **call detection** (no SMS involved at all — Twilio voice works fine in Pakistan even though SMS doesn't).
2. On no-answer, instead of an auto-text, the flow plays a short **voice announcement** to the caller before/after the dial attempt (using TwiML `<Say>` or `<Play>`), e.g.: *"Sorry we couldn't take your call. Please message us on WhatsApp at [number] and we'll respond shortly."*
3. The business's WhatsApp number is a **plain personal or WhatsApp Business App number** (not the API) — the business owner just replies manually from their own phone, like they would to any other WhatsApp message. No automation, no template approval, no per-message cost.
4. A **click-to-chat `wa.me` link** (e.g. `https://wa.me/923001234567`) is generated per business and can be:
   - Read aloud as part of the voice announcement (say the number slowly, or reference "the number on our Google listing")
   - Displayed on the business's dashboard for them to put on their Google Business Profile, website, or signage
   - Included in any marketing materials for that business

**Why this is opt-in-safe:** the customer initiates the WhatsApp conversation themselves by messaging first (via the `wa.me` link or by saving the number and texting it), so there's no business-initiated-message compliance question at all — this sidesteps the entire WhatsApp opt-in problem described earlier in this conversation.

**What you are explicitly NOT building for this track in v1:**
- No WhatsApp Business API / Meta Business verification / BSP account
- No automated WhatsApp replies or templates
- No SMS of any kind to/from Pakistani numbers
- No unified inbox for WhatsApp conversations — the business owner handles WhatsApp replies in their own WhatsApp app, completely outside your dashboard

**Schema addendum:**
```sql
-- Add to businesses table
alter table businesses add column market text default 'us' check (market in ('us', 'pk'));
alter table businesses add column whatsapp_number text; -- E.164, used to generate wa.me links; only relevant when market = 'pk'
alter table businesses add column missed_call_voice_message text default 'Sorry we couldn''t take your call. Please message us on WhatsApp and we''ll get right back to you.';
```
- For `market = 'pk'` businesses: Modules 3-4's SMS logic is simply skipped. The voice webhook (`/api/twilio/voice`) branches on `businesses.market` — if `'pk'`, play `missed_call_voice_message` via `<Say>` instead of (or in addition to) attempting the SMS/conversation flow.
- The `calls`, `conversations`, and `messages` tables remain unused for `market = 'pk'` businesses in v1 — there's no reply channel for your system to capture, since replies happen in the business owner's personal WhatsApp app.

**Dashboard changes for Pakistan-track businesses:**
- Onboarding: ask for `whatsapp_number` instead of setting up SMS message templates; show the generated `wa.me` link and a copy-able "Add this to your Google Business Profile" prompt
- Settings: edit the voice announcement text, edit the WhatsApp number
- No inbox — the "Inbox" nav item is hidden/replaced with a simple "Your WhatsApp number: wa.me/xxx — customers message you directly" info card
- Call log still works (calls are still logged via the Twilio voice webhook regardless of market) — this is useful data even without an SMS reply channel, and doubles as your usage proof to the business owner

**Future upgrade path (not v1):** once/if this track validates and a business wants more (analytics on WhatsApp replies, automated first response, etc.), that's when you'd evaluate the official WhatsApp Business API or a no-code BSP layer (Wati, AiSensy) on top of it — not before.

---

## 3. Project Structure

```
missed-call-saas/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                  # Landing page
│   │   ├── pricing/page.tsx
│   │   ├── privacy/page.tsx          # Required for SMS compliance notice
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Auth-guarded layout
│   │   ├── dashboard/page.tsx        # Overview: missed calls, conversations
│   │   ├── inbox/page.tsx            # SMS conversation threads
│   │   ├── settings/
│   │   │   ├── business/page.tsx     # Business profile, hours, message template
│   │   │   ├── number/page.tsx       # Twilio number setup / call forwarding instructions
│   │   │   └── billing/page.tsx      # Paddle subscription management
│   │   └── onboarding/page.tsx       # First-time setup wizard
│   ├── api/
│   │   ├── twilio/
│   │   │   ├── voice/route.ts        # Twilio webhook: incoming call handling (captures original caller)
│   │   │   ├── voice-status/route.ts # Twilio webhook: dial status callback (no-answer detection)
│   │   │   └── sms/route.ts          # Twilio webhook: incoming SMS replies + STOP/HELP handling
│   │   ├── paddle/
│   │   │   └── webhook/route.ts      # Subscription created/updated/cancelled events
│   │   ├── businesses/route.ts       # CRUD for business profile
│   │   ├── messages/route.ts         # Send/fetch SMS messages
│   │   └── auth/callback/route.ts    # Supabase auth callback
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client (anon key, RLS enforced)
│   │   ├── server.ts                 # Server client (user session, RLS enforced)
│   │   ├── service.ts                # Service-role client for webhooks ONLY (bypasses RLS — see Section 7)
│   │   └── types.ts                  # Generated DB types
│   ├── twilio/
│   │   ├── client.ts                 # Twilio SDK init
│   │   ├── signature.ts              # Webhook signature validation helper
│   │   └── templates.ts              # SMS message template rendering ({business_name}, etc.)
│   ├── paddle/
│   │   ├── client.ts                 # Paddle SDK
│   │   └── signature.ts              # Paddle webhook signature validation helper
│   └── utils/
│       ├── formatPhone.ts            # E.164 normalization
│       └── rateLimiting.ts           # Per-caller cooldown check
├── components/
│   ├── ui/                           # Reusable UI primitives (buttons, cards, inputs)
│   ├── dashboard/
│   │   ├── CallLogTable.tsx
│   │   ├── ConversationThread.tsx
│   │   ├── StatsCards.tsx
│   │   └── OnboardingWizard.tsx
│   └── marketing/
│       ├── Hero.tsx
│       ├── PricingTable.tsx
│       └── DemoVideo.tsx
├── supabase/
│   ├── migrations/                   # SQL migration files (includes RLS policies — see Section 4a)
│   └── seed.sql
├── docs/
│   └── COMPLIANCE.md                 # A2P 10DLC / TCPA notes (Section 2a)
├── middleware.ts                     # Auth route protection
├── .env.local.example
├── package.json
└── README.md
```

---

## 4. Database Schema (Supabase/Postgres)

```sql
-- Enum-style check constraints instead of free text where it matters
create type subscription_status_enum as enum ('trialing', 'active', 'past_due', 'canceled', 'paused');
create type call_status_enum as enum ('no-answer', 'completed', 'busy', 'failed', 'canceled');
create type conversation_status_enum as enum ('open', 'closed', 'spam');

-- Businesses (tenants). One user = one business for v1 (enforced by unique owner_user_id).
create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) not null unique, -- v1: single business per user
  name text not null,
  industry text,                      -- e.g. 'hvac', 'salon', 'detailer'
  twilio_number text unique,          -- Twilio number the business advertises or forwards to
  forwarding_number text,             -- business's real phone number (E.164)
  caller_id_mode text default 'unknown', -- 'passthrough' | 'anonymous' | 'unknown' — see Section 5, Module 3 addendum
  timezone text default 'America/New_York', -- pick a sane default for your target market; do not default to Asia/Karachi if targeting US businesses
  business_hours jsonb,               -- { mon: {open, close}, ... } — stored from v1, enforced starting v1.1 (see Module 3 addendum)
  message_template text default 'Hi! Sorry we missed your call. What can we help you with today?',
  trial_ends_at timestamptz,
  subscription_status subscription_status_enum default 'trialing',
  paddle_customer_id text,
  paddle_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Calls log
create table calls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) not null,
  conversation_id uuid references conversations(id), -- linked once resolved; nullable if caller unresolvable
  caller_number text,                 -- nullable: forwarding may not preserve caller ID (see Module 3 addendum)
  parent_call_sid text,               -- Twilio CallSid of the original inbound leg (before Dial)
  call_sid text unique not null,      -- Twilio CallSid of this leg
  status call_status_enum,
  duration_seconds int,
  auto_text_sent boolean default false,
  auto_text_skipped_reason text,      -- e.g. 'caller_id_unavailable', 'opted_out', 'cooldown_active'
  created_at timestamptz default now()
);
create index idx_calls_business_id on calls(business_id);
create index idx_calls_created_at on calls(created_at desc);

-- Conversations (grouped by caller number per business)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) not null,
  caller_number text not null,
  last_message_at timestamptz,
  status conversation_status_enum default 'open',
  opted_out boolean default false,    -- caller sent STOP; never auto-text again
  created_at timestamptz default now(),
  unique(business_id, caller_number)
);
create index idx_conversations_business_id on conversations(business_id);
create index idx_conversations_caller_number on conversations(caller_number);

-- Messages within a conversation
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text not null,
  message_sid text unique,            -- Twilio MessageSid — unique constraint gives idempotency for free
  delivery_status text,                -- queued | sent | delivered | failed | undelivered (from Twilio status callback)
  sent_by text,                        -- 'system' | 'owner' | auth.users.id as text
  created_at timestamptz default now()
);
create index idx_messages_conversation_id on messages(conversation_id);

-- Subscription/billing events log (for debugging + idempotency on Paddle webhooks)
create table billing_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  paddle_event_id text unique not null, -- idempotency: reject/ignore duplicate deliveries
  event_type text,
  payload jsonb,
  created_at timestamptz default now()
);
```

> Note: `calls.conversation_id` references `conversations` which is defined after it above — when generating the actual migration, either reorder the `create table` statements (conversations before calls) or add the FK via a separate `alter table` after both tables exist. Flagging this so the agent doesn't hit a dependency error copy-pasting linearly.

### 4a. Row Level Security (RLS)

- Enable RLS on all tables above.
- Policy pattern for user-facing tables (`businesses`, `calls`, `conversations`, `messages`): allow `select`/`update` only where the row's `business_id` (or `businesses.owner_user_id` for the businesses table itself) matches `auth.uid()`.
- **Webhook routes never carry a Supabase user session** — Twilio and Paddle call your API directly with no browser auth context. Those routes must use the **service role client** (`lib/supabase/service.ts`, using `SUPABASE_SERVICE_ROLE_KEY`), which bypasses RLS entirely.
  - Because of this, the webhook handler itself is now your security boundary. Always resolve `business_id` server-side from trusted data (e.g. the Twilio number that was called, or the Paddle subscription id) — never trust a `business_id` passed in the request body/query string from an external caller.
  - Validate the Twilio/Paddle signature **before** doing anything else in every webhook handler (see Section 7).

---

## 5. Development Modules (build in this order)

### Module 1 — Project Setup & Auth
- Initialize Next.js + TypeScript + Tailwind project
- Set up Supabase project, connect DB, run initial migrations (including RLS policies from the start — not deferred)
- Implement Supabase Auth (signup/login/logout) with email + Google OAuth
- Auth-guarded dashboard layout via middleware
- **Start A2P 10DLC brand/campaign registration in Twilio now** (Section 2a) — this runs in the background while you build Modules 1-2
- Add `docs/COMPLIANCE.md` stub

**Done when:** a user can sign up, log in, and land on an empty dashboard; 10DLC registration is submitted.

### Module 2 — Business Onboarding
- Onboarding wizard: business name, industry, forwarding number, business hours, timezone, **and `market` selection (US / Pakistan)** — this determines which flow below applies
- **If `market = 'us'` (Track A):** Provision a Twilio number programmatically (or allow manual entry if provisioning via API is deferred); show call-forwarding setup instructions, **and explicitly test + record `caller_id_mode`** for that business's carrier during setup (see Module 3 addendum) — place a test call, see what `From` number your webhook receives, and store whether it's the real caller, the business's own number, or blank/anonymous; show consent notice copy (Section 2a)
- **If `market = 'pk'` (Track B):** Skip caller-ID testing and SMS templates entirely — instead collect `whatsapp_number`, generate the `wa.me` link, and let the business owner customize `missed_call_voice_message` (see Section 2b)
- Save business profile to `businesses` table

**Done when:** a new US business can complete onboarding, see their assigned number + setup instructions, and you've confirmed (via test call) what caller-ID behavior to expect; a new Pakistan business can complete onboarding and see their `wa.me` link and voice announcement text.

### Module 3 — Twilio Voice Webhook (Missed Call Detection)

**Market branch (read this first):** `/api/twilio/voice` and `/api/twilio/voice-status` must check `businesses.market` early. For `market = 'pk'` businesses, skip all SMS logic below entirely — instead, on no-answer, respond with (or route to) a `<Say>{missed_call_voice_message}</Say>` TwiML verb referencing the business's WhatsApp number, and stop. Do not attempt caller-ID resolution, cooldown checks, or `messages`/`conversations` writes for Pakistan-track businesses — none of that infrastructure applies (see Section 2b). Everything below this point in Module 3 applies to `market = 'us'` businesses only.

**Addendum — resolving the original caller (read this before writing code):**
- The *initial* inbound request to `/api/twilio/voice` contains the real caller's number in its `From` parameter. Capture and store this immediately (e.g. in a short-lived cache keyed by `CallSid`, or write a `calls` row right away with `status` pending).
- The `<Dial action="/api/twilio/voice-status">` callback's `From`/`To` describe the **Dial leg**, not necessarily the original caller — don't assume they match. Use `ParentCallSid` (present on the status callback) to look up the original call's `From` you stored in step above.
- **Caller ID may simply be unavailable** if the business set up forwarding on their carrier's side rather than pointing calls directly at Twilio — some carriers strip or replace the original caller ID when forwarding. This is why Module 2 requires a manual test-call verification per business (`caller_id_mode`). If `caller_id_mode` is `anonymous`/`unknown` for a business, the auto-text cannot go out — log `auto_text_skipped_reason = 'caller_id_unavailable'` and surface this clearly in the dashboard so the owner understands why some missed calls didn't get a text, and consider recommending they use the Twilio number directly (not carrier forwarding) instead.
- **Voicemail counts as answered.** If the forwarded line has voicemail enabled, Twilio's Dial often reports `completed` (the call was "answered" by voicemail), not `no-answer` — meaning no auto-text fires by default. Decide explicitly: recommend businesses disable voicemail on the forwarded line for this product to work as intended, and document that recommendation during onboarding.
- If the caller hangs up before the Dial resolves at all (no status callback), handle it as inconclusive — no auto-text, no error.

**Build tasks:**
- `/api/twilio/voice` — validate signature; on first hit, log the call and original `From`; return TwiML with `<Dial timeout="20" action="/api/twilio/voice-status">{forwarding_number}</Dial>`
- `/api/twilio/voice-status` — validate signature; read `DialCallStatus` (Twilio's actual field name — values are `completed`, `busy`, `no-answer`, `failed`, `canceled`); resolve original caller via `ParentCallSid`; on any non-`completed` status:
  - Check `conversations.opted_out` for that caller — skip if true
  - Check cooldown: has this `(business_id, caller_number)` pair been auto-texted in the last 30 minutes? Skip if so (`auto_text_skipped_reason = 'cooldown_active'`)
  - Otherwise send auto-text via Twilio Messaging API using the business's `message_template` (rendered with `{business_name}` etc.)
  - Upsert the `conversations` row, insert the outbound `messages` row, update `calls.auto_text_sent`

**Done when:** calling the Twilio number, not answering (and voicemail disabled), results in an SMS auto-reply within seconds; a `calls` row is logged with the correct original caller number resolved via `ParentCallSid`; opted-out and cooldown cases are correctly skipped and logged.

### Module 4 — SMS Inbox
- `/api/twilio/sms` — validate signature; handle inbound SMS:
  - If body is `STOP`/`UNSUBSCRIBE`/`CANCEL` (case-insensitive) → set `conversations.opted_out = true`, do not forward to owner as a normal message
  - If body is `HELP` → auto-reply with support contact info
  - If body is `START`/`UNSTOP` → clear `opted_out`
  - Otherwise → append to `messages` table under the right conversation, send an owner alert (email via Resend) that a new reply came in
- Dashboard inbox UI: list of conversations (sorted by most recent), thread view, reply box
- Sending a reply from the dashboard calls Twilio Messaging API and inserts an outbound `messages` row
- Track `delivery_status` via Twilio's message status callback
- (Optional v1.1) Realtime updates via Supabase Realtime so new messages appear without refresh — recommended over plain polling once you have real customers, since "manage from your phone" is a core value prop

**Done when:** business owner can see and reply to SMS conversations from the dashboard, gets notified by email on new replies, and opt-out keywords are handled correctly and never re-texted.

### Module 5 — Settings
- Edit business profile, hours, message template (with variable placeholders documented), timezone
- Update forwarding number (re-trigger the caller-ID test-call verification if changed)
- View call log with basic stats (missed calls this week, response rate, skipped/undelivered counts)

**Done when:** business owner can fully self-serve manage their settings without needing you.

### Module 6 — Billing (Paddle Integration)

**Clarify trial flow (pick this explicit model, don't leave it ambiguous):**
- Recommended: create the Paddle subscription **at trial start** (Paddle supports trial periods natively), so there is one source of truth for trial end date and Paddle handles the transition to paid automatically via its own webhooks. Your `trial_ends_at` field becomes a mirror of what Paddle tells you via webhook, not a second independent clock.
- If a customer cancels during the trial, Paddle's `subscription.canceled` webhook is authoritative — update `subscription_status` accordingly and revoke dashboard access immediately.

**Build tasks:**
- Paddle checkout embedded during onboarding (right after business profile creation), using Paddle's native trial period rather than a custom in-app timer
- `/api/paddle/webhook` — validate signature; **check `billing_events.paddle_event_id` for idempotency before processing** (Paddle retries on non-200 responses); handle `subscription.created`, `subscription.updated`, `subscription.canceled`, `subscription.past_due`; update `businesses.subscription_status`, `paddle_customer_id`, `paddle_subscription_id`
- Access gating: shared helper checked in dashboard layout, not duplicated per-page, based on `subscription_status` (not a separate `trial_ends_at` comparison, since Paddle is now the source of truth)
- Simple pricing page

**Done when:** a business can start a Paddle-native trial during onboarding, get billed automatically when it ends, and lose/regain access correctly based on `subscription_status`, with no duplicate processing on webhook retries.

### Module 7 — Marketing Site
> Consider building a minimal landing page + waitlist form earlier (even before Module 3) if you want to start cold outreach while the core engine is still being built — the audit is right that outreach shouldn't wait until Module 7.
- Landing page: headline, problem/solution explanation, demo video/GIF, CTA to start free trial
- Simple pricing page
- Privacy policy page (required — references the SMS consent notice from Section 2a)
- Basic SEO (meta tags, OG image)

**Done when:** you have a shareable link to send to prospects during cold outreach.

### Module 8 (Post-MVP, v1.1+) — Nice-to-haves
- Business-hours-aware auto-texting (use the `business_hours` field that's stored from v1 but unused until now — outside hours, send a different "we're closed, here's when we're open" message)
- AI-drafted SMS replies (using Anthropic/OpenAI API) suggesting a response based on conversation context
- Auto-booking link inserted into the missed-call text
- Scheduled follow-up sequences (separate compliance/opt-in campaign — see Section 2a)
- Post-appointment review request automation (this is your natural upsell)
- Multi-user access per business (staff logins) — note current schema assumes one owner per business; this needs a join table later
- Analytics dashboard (missed call trends, response time, conversion rate)
- Admin/support view for debugging Twilio/Paddle issues across all customers — worth pulling forward if you're onboarding real customers before this is "post-MVP" in practice

---

## 6. Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # webhooks only — never expose client-side

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=         # use a Messaging Service (not a bare From number) if provisioning multiple numbers — clarifies sender pool management

# Paddle
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=

# Email
RESEND_API_KEY=

# Error tracking
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 7. Key Implementation Notes for the Cursor Agent

- **Twilio no-answer detection:** Use `<Dial timeout="20" action="/api/twilio/voice-status">` in the TwiML response. The status callback's outcome field is `DialCallStatus`, with values `completed`, `busy`, `no-answer`, `failed`, `canceled` — `completed` means the callee (or their voicemail) picked up; only trigger the auto-text on `no-answer`, `busy`, or `failed`.
- **Resolve the original caller via `ParentCallSid`**, not the `From`/`To` on the status callback (see Module 3 addendum). Caller ID may be unavailable depending on the business's carrier forwarding setup — handle that gracefully (Section 5, Module 3).
- **Avoid double-texting:** Use a conversation-level cooldown (`conversations.last_message_at` or a dedicated `last_auto_text_at` column), not just `calls.auto_text_sent` per call row — a caller who calls three times in ten minutes should only get texted once.
- **Phone number formatting:** Always normalize to E.164 format before storing or querying — use a small utility function, don't rely on raw Twilio input. Note: your target businesses are likely US-based (`+1XXXXXXXXXX`), not `+92` — confirm your actual target market before hardcoding any country assumption.
- **Multi-tenancy:** Every query must be scoped by `business_id`. RLS policies enforce this for user-facing routes; webhook routes use the service role client and must resolve `business_id` from trusted server-side lookups only (Section 4a) — never from caller-supplied data.
- **Webhook security:** Validate Twilio (`X-Twilio-Signature`) and Paddle webhook signatures **before** parsing/trusting the payload. In Next.js Route Handlers, read the **raw request body** for signature verification — the framework's default JSON body parsing will break signature validation if you read `req.json()` first. Read raw text/bytes, verify, then parse.
- **Idempotency:** Twilio and Paddle both retry webhook deliveries on timeout or non-2xx responses. `messages.message_sid` and `billing_events.paddle_event_id` have unique constraints specifically so a retry doesn't create a duplicate text or double-process a billing event — check for existing rows (or catch the unique violation) and return 200 early on duplicates.
- **Timezone handling:** Store business hours logic carefully. Business-hours gating is deferred to v1.1 (Module 8) — for v1, the auto-text fires 24/7 regardless of `business_hours`. Document this clearly in the onboarding UI so business owners aren't surprised by a 2am auto-text.
- **Trial logic:** Paddle is the source of truth for trial state (Module 6) — don't run a parallel in-app timer that can drift out of sync.

---

## 8. Suggested Build Timeline (Solo, AI-assisted)

> Adjusted from v1: A2P 10DLC registration is likely the actual critical path, not the coding — start it on Day 1 and build around its approval time, which is carrier-dependent and outside your control.

| Days | Focus |
|---|---|
| 1 | Module 1 (setup + auth) + **submit A2P 10DLC registration immediately** |
| 1–2 (parallel) | Minimal landing page + waitlist, so outreach can start early |
| 2–3 | Module 2 (onboarding, incl. manual caller-ID test-call verification step) |
| 3–6 | Module 3 (core engine — caller-ID resolution, voicemail handling, opt-out/cooldown logic; budget extra time here vs. v1's estimate, since this module absorbed most of the audit's findings) |
| 6–8 | Module 4 (inbox + STOP/HELP handling + owner email alerts) |
| 8–9 | Module 5 (settings) |
| 9–11 | Module 6 (billing — confirm 10DLC status hasn't blocked launch by now) |
| 11–12 | Module 7 (finish marketing site/pricing/privacy page) |
| 12–15 | Bug fixes, polish, onboard first real trial customers |

---

## 9. Open Decisions to Make Before/During Build

- **New Twilio number per business vs. carrier call forwarding?** → Recommendation, revised: carrier forwarding is more convenient for adoption but risks losing caller ID entirely depending on the business's carrier (Section 5, Module 3 addendum) — a broken caller ID silently defeats the whole product. Safer default: **advertise the Twilio number directly** (on Google Business Profile, website, business cards going forward) rather than relying on carrier-side forwarding, and offer carrier forwarding as an option you explicitly test and label per business (`caller_id_mode`) rather than assuming it works.
- Should replies from the dashboard show as coming from the Twilio number or get routed to the owner's personal phone too? → Recommendation: v1 = dashboard-only inbox + email alert on new messages, keep it simple.
- Currency/pricing display: Paddle will handle local currency conversion for international customers automatically — decide your base USD price now (e.g. $49/mo) and let Paddle localize.
- **Target market confirmation:** this spec assumes US businesses/US numbers for the compliance section (Section 2a). If you're targeting a different country first, the 10DLC/TCPA specifics change and this section needs to be redone for that jurisdiction before Module 3.

---

## Changelog (v2 → v3)

- Added Section 2b: the Pakistan track — voice-announcement-based, `wa.me` click-to-chat pointer flow, deliberately avoiding both SMS (unsupported for two-way in Pakistan per Twilio's own guidelines) and the official WhatsApp Business API (cost/complexity not justified pre-validation)
- Added `market`, `whatsapp_number`, `missed_call_voice_message` columns to `businesses`
- Updated Module 2 (onboarding) and Module 3 (voice webhook) to branch on `market`, skipping SMS-specific steps entirely for Pakistan-track businesses
- Clarified that `calls`, `conversations`, `messages` tables remain unused for Pakistan-track businesses in v1 — no reply channel exists for the system to capture, since WhatsApp replies happen in the owner's own app
- Documented a future upgrade path (official WhatsApp Business API / no-code BSP) as an explicit non-goal for v1

---

## Changelog (v1 → v2)

- Added Section 2a: SMS & telephony compliance (A2P 10DLC, TCPA/consent, STOP/HELP handling, content rules)
- Added Module 3 addendum: caller ID resolution via `ParentCallSid`, carrier forwarding caller-ID risk, voicemail-as-answered behavior
- Fixed `DialCallStatus` terminology throughout (was inconsistently `answered`/`completed`)
- Schema: added `opted_out`, `caller_id_mode`, `auto_text_skipped_reason`, `delivery_status`, `updated_at`, `paddle_customer_id`, `paddle_event_id` (unique), indexes on `business_id`/`created_at`/`caller_number`, enum types instead of free text, unique `owner_user_id` to enforce one-business-per-user for v1
- Added Section 4a: RLS policy pattern + explicit note that webhook routes use the service-role client and must resolve `business_id` server-side only
- Clarified Module 6: Paddle-native trial as single source of truth, removing the ambiguity between in-app `trial_ends_at` and Paddle's own state
- Added idempotency requirements for Twilio/Paddle webhook retries (Section 7)
- Added owner email alerts on new inbound replies (Module 4)
- Added STOP/HELP/START keyword handling (Module 4)
- Default timezone changed from `Asia/Karachi` to a US default, with an explicit flag to confirm target market
- Timeline adjusted: 10DLC registration moved to Day 1 (parallel critical path), Module 3 given more time, landing page pulled earlier for outreach
- Added `docs/COMPLIANCE.md`, `privacy/page.tsx`, raw-body webhook note, Messaging Service SID clarification
