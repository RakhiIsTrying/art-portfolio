create table if not exists print_club_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null,
  birthday date,
  birthday_request text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  region text not null,
  postal_code text not null,
  country text not null,
  plan text not null check (plan in ('india', 'international')),
  created_at timestamptz not null default now()
);

-- In case the table was created before this column existed
alter table print_club_signups add column if not exists birthday_request text;

-- Only the server (service role) reads or writes sign-ups
alter table print_club_signups enable row level security;
