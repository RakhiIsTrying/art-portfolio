alter table artworks add column if not exists prints_available boolean not null default true;
alter table artworks add column if not exists original_available boolean not null default false;
