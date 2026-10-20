alter table videos add column if not exists category text
  check (category in ('music', 'movies', 'comics', 'paper', 'bee-ben'));
alter table videos add column if not exists instagram_url text;

-- Backfill the imported Instagram reels
update videos v set category = d.category, instagram_url = d.instagram_url
from (values
  ('Joker', 'movies', 'https://www.instagram.com/reel/Deel8tPo93K/'),
  ('Ghostface', 'movies', 'https://www.instagram.com/reel/DeZ7XEiRBY2/'),
  ('Vito Corleone', 'movies', 'https://www.instagram.com/reel/DeZZFcboUeG/'),
  ('Pennywise', 'movies', 'https://www.instagram.com/reel/DeUsYkDz12o/'),
  ('The Life of a Showgirl', 'music', 'https://www.instagram.com/reel/DVnECKzCDAc/'),
  ('Class Choreographed', 'music', 'https://www.instagram.com/reel/DVUFUn9CLyV/'),
  ('45.6 Billion Won', 'bee-ben', 'https://www.instagram.com/reel/DVWNGnaEa-f/'),
  ('Me Drawing (ft. Dug-Dug''s Snoring)', 'bee-ben', 'https://www.instagram.com/reel/Dd0fuNcuHhz/'),
  ('My Dog', 'bee-ben', 'https://www.instagram.com/reel/Dc9aZeoRU5A/'),
  ('Dug-Dug in Japan', 'bee-ben', 'https://www.instagram.com/reel/Dc6jg1ZOOWc/'),
  ('Romanticising Dinner', 'bee-ben', 'https://www.instagram.com/reel/DVqXgPtka4Y/'),
  ('Running Away', 'bee-ben', 'https://www.instagram.com/reel/DVMFWx4CLmv/'),
  ('Picnic to Panic', 'bee-ben', 'https://www.instagram.com/reel/DVHKseLE97u/'),
  ('Inner Demons', 'bee-ben', 'https://www.instagram.com/reel/DVGu2iHiJCO/'),
  ('Skin Barrier', 'bee-ben', 'https://www.instagram.com/reel/DUntrkBEWHH/'),
  ('Just a Girl', 'bee-ben', 'https://www.instagram.com/reel/DUieh1AiCkg/'),
  ('Thug Life', 'bee-ben', 'https://www.instagram.com/reel/DUdUFaGiNeR/')
) as d(title, category, instagram_url)
where v.title = d.title;
