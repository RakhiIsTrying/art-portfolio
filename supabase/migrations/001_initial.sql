-- Collections (static slugs, managed in code — but stored for sort order)
create table collections (
  slug        text primary key,
  name        text not null,
  icon_emoji  text not null,
  sort_order  integer not null default 0
);

insert into collections (slug, name, icon_emoji, sort_order) values
  ('music',   'Music & Pop Culture', '🎵', 1),
  ('movies',  'Movies & TV',         '🎬', 2),
  ('comics',  'Comics & Anime',      '💥', 3),
  ('bee-ben', 'Bee, Ben & Dug-Dug',  '🐝', 4),
  ('paper',   'Paper Art',           '✂️', 5);

-- Artworks
create table artworks (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  collection_slug text not null references collections(slug),
  image_url       text not null,
  medium          text,
  year            integer,
  featured        boolean not null default false,
  featured_order  integer,
  created_at      timestamptz not null default now()
);

create index on artworks(collection_slug);
create index on artworks(featured, featured_order);

-- Videos
create table videos (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  youtube_url   text not null,
  thumbnail_url text not null,
  description   text,
  created_at    timestamptz not null default now()
);

-- Pages (for puzzles + about rich text)
create table pages (
  slug         text primary key,
  content_json jsonb not null default '{}',
  updated_at   timestamptz not null default now()
);

insert into pages (slug, content_json) values
  ('puzzles', '{"blocks": []}'),
  ('about',   '{"bio": "", "photo_url": "", "socials": []}');

-- Storage bucket for artwork images
insert into storage.buckets (id, name, public)
values ('artworks', 'artworks', true);

-- Public read policy for artworks bucket
create policy "Public read artworks"
  on storage.objects for select
  using (bucket_id = 'artworks');
