-- Optional photos for profile info sections
alter table public.profiles
  add column if not exists bio_image text,
  add column if not exists station_setup_image text,
  add column if not exists antenna_setup_image text,
  add column if not exists qsl_info_image text;
