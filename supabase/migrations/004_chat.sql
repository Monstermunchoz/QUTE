-- Conversations (uniquement entre matchs)
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matchs(id) on delete cascade unique,
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;

create policy "voit ses conversations" on public.conversations
  for select using (
    exists (
      select 1 from public.matchs m
      where m.id = match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

create policy "cree sa conversation" on public.conversations
  for insert with check (
    exists (
      select 1 from public.matchs m
      where m.id = match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

-- Messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  auteur_id uuid references public.profiles(id) on delete cascade,
  contenu text not null check (char_length(contenu) <= 1000),
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "voit les messages de ses conversations" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      join public.matchs m on m.id = c.match_id
      where c.id = conversation_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

create policy "envoie un message" on public.messages
  for insert with check (
    auth.uid() = auteur_id
    and exists (
      select 1 from public.conversations c
      join public.matchs m on m.id = c.match_id
      where c.id = conversation_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

alter publication supabase_realtime add table public.messages;
