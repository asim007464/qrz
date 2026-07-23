-- Feed post replies
create table if not exists public.feed_replies (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  created_at timestamptz default now()
);

create index if not exists feed_replies_post_idx on public.feed_replies (post_id, created_at asc);

alter table public.feed_replies enable row level security;

create policy "Public read feed replies" on public.feed_replies for select using (true);
create policy "Users manage own replies" on public.feed_replies for all using (auth.uid() = user_id);
