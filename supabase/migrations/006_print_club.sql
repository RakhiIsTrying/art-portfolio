create table if not exists print_club_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  country text not null,
  note text,
  created_at timestamptz not null default now()
);

-- Only the server (service role) reads or writes sign-ups
alter table print_club_signups enable row level security;
