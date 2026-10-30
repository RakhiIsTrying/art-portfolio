-- Videos can be filed under Sketchbook too (same collections as the gallery)
alter table videos drop constraint if exists videos_category_check;
alter table videos add constraint videos_category_check
  check (category in ('music', 'movies', 'comics', 'bee-ben', 'sketchbook', 'paper'));
