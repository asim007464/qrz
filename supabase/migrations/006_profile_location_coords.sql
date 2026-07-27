-- Map coordinates for operator locations
alter table public.profiles
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

create index if not exists profiles_coords_idx
  on public.profiles (latitude, longitude)
  where latitude is not null and longitude is not null;
