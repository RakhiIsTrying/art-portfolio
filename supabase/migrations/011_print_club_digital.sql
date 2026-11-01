-- Van Gogh Anywhere: a third tier, with nothing to ship
alter table print_club_signups
  drop constraint if exists print_club_signups_tier_check,
  add constraint print_club_signups_tier_check check (tier in ('digital', 'broke', 'baroque')),
  alter column address_line1 drop not null,
  alter column city drop not null,
  alter column region drop not null,
  alter column postal_code drop not null;
