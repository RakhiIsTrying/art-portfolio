-- More detail per visit: the visitor's IP address, browser and system versions, screen size, language and time zone
alter table analytics_events
  add column if not exists ip text,
  add column if not exists browser_version text,
  add column if not exists os_version text,
  add column if not exists screen text,
  add column if not exists language text,
  add column if not exists timezone text;
