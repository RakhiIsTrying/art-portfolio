-- Allow videos to be uploaded files (e.g. Instagram reels), not only YouTube links
alter table videos add column video_url text;
alter table videos alter column youtube_url drop not null;
alter table videos alter column thumbnail_url drop not null;
alter table videos add constraint videos_has_source
  check (youtube_url is not null or video_url is not null);
