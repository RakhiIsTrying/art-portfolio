create table if not exists print_club_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null,
  birthday date,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  region text,
  postal_code text,
  country text not null,
  plan text not null check (plan in ('india', 'international')),
  note text,
  created_at timestamptz not null default now()
);

-- Only the server (service role) reads or writes sign-ups
alter table print_club_signups enable row level security;
