-- QRZ Social — Supabase schema
-- Run in Supabase SQL Editor (new project) or via CLI

create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  callsign text not null default '',
  email text default '',
  bio text default '',
  avatar_url text,
  location text default '',
  country text default '',
  itu_zone text default '',
  active_band text default '',
  active_frequency text default '',
  active_mode text default '',
  cq_zone text default '',
  grid text default '',
  station_setup text default '',
  antenna_setup text default '',
  qsl_info text default '',
  phone text default '',
  website text default '',
  qrz text default '',
  on_air boolean not null default false,
  background_image text,
  social_links jsonb not null default '{}',
  role text not null default 'member' check (role in ('member', 'staff', 'admin')),
  is_blocked boolean not null default false,
  profile_views int not null default 0,
  profile_searches int not null default 0,
  cards_received int not null default 0,
  cards_sent int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists profiles_callsign_lower_idx
  on public.profiles (lower(callsign))
  where callsign <> '';

-- QSL templates (admin-managed)
create table if not exists public.qsl_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  background_color text not null default '#1e4d5c',
  accent_color text not null default '#e8652a',
  border_color text not null default '#f5e6c8',
  background_image text,
  preview_image text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- QSL cards
create type public.qsl_status as enum ('pending', 'accepted', 'rejected', 'sent');

create table if not exists public.qsl_cards (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references public.qsl_templates(id) on delete set null,
  from_user_id uuid references public.profiles(id) on delete set null,
  to_user_id uuid references public.profiles(id) on delete set null,
  from_callsign text not null,
  to_callsign text not null,
  from_name text default '',
  from_address text default '',
  from_country text default '',
  itu_zone text default '',
  qso_date date,
  qso_utc text default '',
  mhz text default '',
  mode text default '',
  rst text default '',
  qsl_via text default '',
  status public.qsl_status not null default 'pending',
  background_image text,
  thumbnail text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists qsl_cards_from_user_idx on public.qsl_cards (from_user_id, created_at desc);
create index if not exists qsl_cards_to_user_idx on public.qsl_cards (to_user_id, created_at desc);

-- Network follows
create table if not exists public.network_follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'following' check (status in ('following', 'request', 'connected')),
  created_at timestamptz default now(),
  unique (follower_id, following_id)
);

-- Feed posts
create table if not exists public.feed_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  image_url text,
  created_at timestamptz default now()
);

create index if not exists feed_posts_created_idx on public.feed_posts (created_at desc);

-- Support messages
create table if not exists public.support_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null default '',
  email text not null default '',
  subject text default '',
  message text not null,
  status text not null default 'open' check (status in ('open', 'replied', 'closed')),
  admin_reply text,
  created_at timestamptz default now()
);

-- Broadcasts
create table if not exists public.broadcasts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Site settings (lockdown, etc.)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz default now()
);

insert into public.site_settings (key, value)
values ('lockdown', '{"enabled": false}'::jsonb)
on conflict (key) do nothing;

-- OTP tables
create table if not exists public.password_reset_otps (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  failed_attempts int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.email_verification_otps (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  failed_attempts int not null default 0,
  created_at timestamptz default now()
);

create index if not exists password_reset_otps_email_idx on public.password_reset_otps (email, created_at desc);
create index if not exists email_verification_otps_email_idx on public.email_verification_otps (email, created_at desc);

-- Profile trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, callsign, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'callsign', ''),
    coalesce(new.email, ''),
    case
      when lower(coalesce(new.email, '')) = 'qrzinfo@gmail.com' then 'admin'
      else 'member'
    end
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed default QSL templates
insert into public.qsl_templates (name, background_color, accent_color, border_color, is_active)
values
  ('Classic Teal', '#1e4d5c', '#e8652a', '#f5e6c8', true),
  ('Purple Night', '#2e1a47', '#7c3aed', '#d4ff5c', true),
  ('Vintage Cream', '#f5e6c8', '#1e4d5c', '#e8652a', true)
on conflict do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.qsl_templates enable row level security;
alter table public.qsl_cards enable row level security;
alter table public.network_follows enable row level security;
alter table public.feed_posts enable row level security;
alter table public.support_messages enable row level security;
alter table public.broadcasts enable row level security;
alter table public.site_settings enable row level security;

create policy "Public read profiles" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Public read active templates" on public.qsl_templates for select using (is_active = true);
create policy "Public read qsl cards" on public.qsl_cards for select using (true);
create policy "Users manage own qsl cards" on public.qsl_cards for all using (auth.uid() = from_user_id);

create policy "Public read feed" on public.feed_posts for select using (true);
create policy "Users manage own posts" on public.feed_posts for all using (auth.uid() = user_id);

create policy "Public read active broadcasts" on public.broadcasts for select using (is_active = true);
create policy "Public read lockdown setting" on public.site_settings for select using (key = 'lockdown');

create policy "Users read own follows" on public.network_follows for select using (auth.uid() = follower_id or auth.uid() = following_id);
create policy "Users manage own follows" on public.network_follows for all using (auth.uid() = follower_id);

create policy "Anyone can submit support" on public.support_messages for insert with check (true);
