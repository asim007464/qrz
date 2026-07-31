-- Direct messages between operators
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  participant_a uuid not null references public.profiles(id) on delete cascade,
  participant_b uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz default now(),
  last_message_preview text not null default '',
  created_at timestamptz default now(),
  constraint conversations_ordered_pair check (participant_a < participant_b),
  constraint conversations_unique_pair unique (participant_a, participant_b)
);

create table if not exists public.direct_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);

create index if not exists conversations_participant_a_idx
  on public.conversations (participant_a, last_message_at desc);
create index if not exists conversations_participant_b_idx
  on public.conversations (participant_b, last_message_at desc);
create index if not exists direct_messages_conversation_idx
  on public.direct_messages (conversation_id, created_at asc);
create index if not exists direct_messages_unread_idx
  on public.direct_messages (conversation_id, sender_id, read_at);

alter table public.conversations enable row level security;
alter table public.direct_messages enable row level security;

create policy "Participants read conversations"
  on public.conversations for select
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Participants insert conversations"
  on public.conversations for insert
  with check (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Participants update conversations"
  on public.conversations for update
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Participants read messages"
  on public.direct_messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

create policy "Participants send messages"
  on public.direct_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

create policy "Recipients mark messages read"
  on public.direct_messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );
