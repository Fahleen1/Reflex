-- v3: Pakistan track (Section 2b) — market branching + WhatsApp fields
alter table businesses add column if not exists market text default 'us'
  check (market in ('us', 'pk'));

alter table businesses add column if not exists whatsapp_number text;

alter table businesses add column if not exists missed_call_voice_message text
  default 'Sorry we couldn''t take your call. Please message us on WhatsApp and we''ll get right back to you.';
