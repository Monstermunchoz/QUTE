-- Trust & Safety V1
-- Les patterns métier vivent dans trust_rules (remplissage manuel).
-- salon_id est ajouté à la quarantaine pour les messages de salon.

create table if not exists public.trust_rules (
  id uuid default gen_random_uuid() primary key,
  pattern text not null,
  categorie text check (categorie in (
    'drogue','arme','arnaque','menace','harcelement','mineur','spam','lien_suspect'
  )),
  poids integer default 1 check (poids between 1 and 5),
  actif boolean default true,
  created_at timestamptz default now()
);

alter table public.trust_rules enable row level security;

drop policy if exists "admin gere les regles" on public.trust_rules;
create policy "admin gere les regles" on public.trust_rules
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','moderateur')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','moderateur')
    )
  );

alter table public.messages
  add column if not exists a_verifier boolean default false,
  add column if not exists trust_score integer default 0,
  add column if not exists trust_categorie text,
  add column if not exists masque boolean default false;

alter table public.salon_messages
  add column if not exists a_verifier boolean default false,
  add column if not exists trust_score integer default 0,
  add column if not exists trust_categorie text,
  add column if not exists masque boolean default false;

create table if not exists public.messages_quarantaine (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  salon_id uuid references public.salons(id) on delete cascade,
  auteur_id uuid references public.profiles(id) on delete cascade,
  contenu text not null,
  trust_score integer,
  trust_categorie text,
  statut text default 'en_attente'
    check (statut in ('en_attente','supprime','innocente')),
  traite_par uuid references public.profiles(id),
  traite_at timestamptz,
  created_at timestamptz default now()
);

alter table public.messages_quarantaine
  add column if not exists salon_id uuid references public.salons(id) on delete cascade;

alter table public.messages_quarantaine enable row level security;

drop policy if exists "admin voit quarantaine" on public.messages_quarantaine;
create policy "admin voit quarantaine" on public.messages_quarantaine
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','moderateur')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','moderateur')
    )
  );

grant select, insert, update, delete on public.trust_rules to authenticated;
grant select, insert, update, delete on public.messages_quarantaine to authenticated;

-- Messages masqués invisibles hors staff
drop policy if exists "voit les messages de ses conversations" on public.messages;
create policy "voit les messages de ses conversations" on public.messages
  for select using (
    (masque is not true or public.is_staff())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (
        c.initiateur_id = auth.uid()
        or c.destinataire_id = auth.uid()
        or exists (
          select 1 from public.matchs m
          where m.id = c.match_id
          and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
        )
      )
    )
  );

drop policy if exists "staff voit tous les messages" on public.messages;
create policy "staff voit tous les messages" on public.messages
  for select using (public.is_staff());

drop policy if exists "staff modere messages" on public.messages;
create policy "staff modere messages" on public.messages
  for update using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "staff supprime messages" on public.messages;
create policy "staff supprime messages" on public.messages
  for delete using (public.is_staff());

drop policy if exists "lecture messages salon" on public.salon_messages;
create policy "lecture messages salon" on public.salon_messages
  for select using (
    auth.uid() is not null
    and (masque is not true or public.is_staff())
  );

drop policy if exists "staff voit tous salon_messages" on public.salon_messages;
create policy "staff voit tous salon_messages" on public.salon_messages
  for select using (public.is_staff());

drop policy if exists "staff modere salon_messages" on public.salon_messages;
create policy "staff modere salon_messages" on public.salon_messages
  for update using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "staff supprime salon_messages" on public.salon_messages;
create policy "staff supprime salon_messages" on public.salon_messages
  for delete using (public.is_staff());

notify pgrst, 'reload schema';
