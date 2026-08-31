-- Enum types
create type subscription_status_enum as enum ('trialing', 'active', 'past_due', 'canceled', 'paused');
create type call_status_enum as enum ('no-answer', 'completed', 'busy', 'failed', 'canceled');
create type conversation_status_enum as enum ('open', 'closed', 'spam');

-- Businesses (tenants). One user = one business for v1.
create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) not null unique,
  name text not null,
  industry text,
  twilio_number text unique,
  forwarding_number text,
  caller_id_mode text default 'unknown' check (caller_id_mode in ('passthrough', 'anonymous', 'unknown')),
  timezone text default 'America/New_York',
  business_hours jsonb,
  message_template text default 'Hi! Sorry we missed your call. What can we help you with today?',
  trial_ends_at timestamptz,
  subscription_status subscription_status_enum default 'trialing',
  paddle_customer_id text,
  paddle_subscription_id text,
  market text default 'us' check (market in ('us', 'pk')),
  whatsapp_number text,
  missed_call_voice_message text default 'Sorry we couldn''t take your call. Please message us on WhatsApp and we''ll get right back to you.',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversations (must exist before calls FK)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) not null,
  caller_number text not null,
  last_message_at timestamptz,
  status conversation_status_enum default 'open',
  opted_out boolean default false,
  created_at timestamptz default now(),
  unique(business_id, caller_number)
);
create index idx_conversations_business_id on conversations(business_id);
create index idx_conversations_caller_number on conversations(caller_number);

-- Calls log
create table calls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) not null,
  conversation_id uuid references conversations(id),
  caller_number text,
  parent_call_sid text,
  call_sid text unique not null,
  status call_status_enum,
  duration_seconds int,
  auto_text_sent boolean default false,
  auto_text_skipped_reason text,
  created_at timestamptz default now()
);
create index idx_calls_business_id on calls(business_id);
create index idx_calls_created_at on calls(created_at desc);

-- Messages within a conversation
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text not null,
  message_sid text unique,
  delivery_status text,
  sent_by text,
  created_at timestamptz default now()
);
create index idx_messages_conversation_id on messages(conversation_id);

-- Subscription/billing events log
create table billing_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  paddle_event_id text unique not null,
  event_type text,
  payload jsonb,
  created_at timestamptz default now()
);

-- updated_at trigger for businesses
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger businesses_updated_at
  before update on businesses
  for each row execute function update_updated_at_column();

-- Row Level Security
alter table businesses enable row level security;
alter table calls enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table billing_events enable row level security;

-- businesses: owner can select/insert/update their own row
create policy "Users can view own business"
  on businesses for select
  using (owner_user_id = auth.uid());

create policy "Users can insert own business"
  on businesses for insert
  with check (owner_user_id = auth.uid());

create policy "Users can update own business"
  on businesses for update
  using (owner_user_id = auth.uid());

-- calls: scoped via business ownership
create policy "Users can view own calls"
  on calls for select
  using (
    business_id in (
      select id from businesses where owner_user_id = auth.uid()
    )
  );

-- conversations: scoped via business ownership
create policy "Users can view own conversations"
  on conversations for select
  using (
    business_id in (
      select id from businesses where owner_user_id = auth.uid()
    )
  );

create policy "Users can update own conversations"
  on conversations for update
  using (
    business_id in (
      select id from businesses where owner_user_id = auth.uid()
    )
  );

-- messages: scoped via conversation -> business ownership
create policy "Users can view own messages"
  on messages for select
  using (
    conversation_id in (
      select c.id from conversations c
      join businesses b on b.id = c.business_id
      where b.owner_user_id = auth.uid()
    )
  );

-- billing_events: read-only for owner
create policy "Users can view own billing events"
  on billing_events for select
  using (
    business_id in (
      select id from businesses where owner_user_id = auth.uid()
    )
  );
