alter table public.profiles
  add column if not exists active_band text default '',
  add column if not exists active_frequency text default '',
  add column if not exists active_mode text default '',
  add column if not exists cq_zone text default '',
  add column if not exists grid text default '';

