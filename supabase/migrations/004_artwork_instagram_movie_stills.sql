alter table artworks add column if not exists instagram_url text;

-- Movie art stills: the finished-poster frame of each movie reel
insert into artworks (title, collection_slug, image_url, medium, year, featured, instagram_url, created_at)
select v.title, 'movies', v.thumbnail_url, 'Digital', 2026, false, v.instagram_url, v.created_at
from videos v
where v.category = 'movies'
  and v.thumbnail_url is not null
  and not exists (select 1 from artworks a where a.title = v.title and a.collection_slug = 'movies');

-- Instagram links for posts visible on the public profile
update artworks a set instagram_url = d.instagram_url
from (values
  ('KATSEYE', 'https://www.instagram.com/p/Dd97acQE7fk/'),
  ('Spirited Away', 'https://www.instagram.com/p/DeUldJROWp7/')
) as d(title, instagram_url)
where a.title = d.title;
