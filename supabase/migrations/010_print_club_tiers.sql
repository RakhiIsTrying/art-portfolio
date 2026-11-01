-- Print Club tiers. Everyone who joined before tiers existed paid the higher price.
alter table print_club_signups
  add column if not exists tier text not null default 'baroque' check (tier in ('broke', 'baroque'));
