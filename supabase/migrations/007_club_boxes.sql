-- One row per month's Print Club box: photos, unboxing video, and the gallery pieces inside
create table if not exists club_boxes (
  id          uuid primary key default gen_random_uuid(),
  month       text not null unique check (month ~ '^\d{4}-\d{2}$'),  -- e.g. 2026-11
  note        text,
  photo_urls  text[] not null default '{}',
  video_url   text,
  artwork_ids uuid[] not null default '{}',
  created_at  timestamptz not null default now()
);

alter table club_boxes enable row level security;
drop policy if exists "Public read club boxes" on club_boxes;
create policy "Public read club boxes" on club_boxes for select using (true);

-- Public bucket for box photos + unboxing videos (uploads go through the admin page)
insert into storage.buckets (id, name, public)
values ('club-boxes', 'club-boxes', true)
on conflict (id) do nothing;

drop policy if exists "Public read club-boxes" on storage.objects;
create policy "Public read club-boxes" on storage.objects for select using (bucket_id = 'club-boxes');
