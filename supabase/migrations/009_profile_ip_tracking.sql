-- Track last known client IP and approx location for admin visibility
alter table public.profiles
  add column if not exists last_ip text,
  add column if not exists last_ip_location text,
  add column if not exists last_ip_at timestamptz,
  add column if not exists signup_ip text;
