-- First-party site analytics. No IP addresses or names: visitors are anonymous random ids.
create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  path text,
  label text,
  seconds integer,
  visitor_id text not null,
  session_id text not null,
  source text,
  referrer text,
  utm_medium text,
  utm_campaign text,
  country text,
  region text,
  city text,
  device text,
  browser text,
  os text
);
create index if not exists analytics_events_created_at_idx on analytics_events (created_at desc);

-- Only the server (service role) reads or writes events
alter table analytics_events enable row level security;
