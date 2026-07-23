-- Optional HRDLOG.net callsign for profile log widget
alter table public.profiles
  add column if not exists hrdlog_callsign text default '';
