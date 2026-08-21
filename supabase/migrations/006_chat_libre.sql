-- Statut des conversations
alter table public.conversations
  add column if not exists statut text default 'acceptee'
  check (statut in ('en_attente','acceptee','ignoree'));

alter table public.conversations
  add column if not exists initiateur_id uuid references public.profiles(id);

alter table public.conversations
  add column if not exists destinataire_id uuid references public.profiles(id);

-- Conversations sans match
alter table public.conversations
  alter column match_id drop not null;

-- Policy mise à jour
drop policy if exists "voit ses conversations" on public.conversations;
drop policy if exists "cree sa conversation" on public.conversations;
drop policy if exists "cree une conversation" on public.conversations;
drop policy if exists "accepte ou ignore" on public.conversations;

create policy "voit ses conversations" on public.conversations
  for select using (
    auth.uid() = initiateur_id or auth.uid() = destinataire_id
    or exists (
      select 1 from public.matchs m
      where m.id = match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

create policy "cree une conversation" on public.conversations
  for insert with check (
    auth.uid() = initiateur_id
    or exists (
      select 1 from public.matchs m
      where m.id = match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

create policy "accepte ou ignore" on public.conversations
  for update using (
    auth.uid() = destinataire_id
    or auth.uid() = initiateur_id
  )
  with check (
    auth.uid() = destinataire_id
    or auth.uid() = initiateur_id
  );

-- Messages accessibles hors match
drop policy if exists "voit les messages de ses conversations" on public.messages;
drop policy if exists "envoie un message" on public.messages;

create policy "voit les messages de ses conversations" on public.messages
  for select using (
    exists (
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

create policy "envoie un message" on public.messages
  for insert with check (
    auth.uid() = auteur_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (
        (c.initiateur_id = auth.uid() and c.statut in ('en_attente', 'acceptee'))
        or (c.destinataire_id = auth.uid() and c.statut = 'acceptee')
        or exists (
          select 1 from public.matchs m
          where m.id = c.match_id
          and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
        )
      )
    )
  );

-- LIEUX
create table public.lieux (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  categorie text check (categorie in ('bar','club','sauna','cafe','association','commerce','culture','exterieur','autre')),
  adresse text,
  ville text default 'Lyon',
  latitude numeric(10,7),
  longitude numeric(10,7),
  description text,
  site_web text,
  instagram text,
  est_verifie boolean default false,
  created_at timestamptz default now()
);

alter table public.lieux enable row level security;

create policy "lecture lieux" on public.lieux
  for select using (true);

-- Quelques lieux Lyon de test
insert into public.lieux (nom, categorie, adresse, latitude, longitude, description) values
  ('Le Marché Gare', 'club', '35 Rue du Bât d''Argent, Lyon', 45.7489, 4.8317, 'Club techno emblématique de Lyon'),
  ('La Rayonne', 'club', 'Parc de Parilly, Bron', 45.7234, 4.8891, 'Salle de concert et club'),
  ('Le Sucre', 'club', '50 Quai Rambaud, Lyon', 45.7412, 4.8156, 'Club sur les quais, vue panoramique'),
  ('Café de la Cloche', 'cafe', '5 Place Antonin Poncet, Lyon', 45.7578, 4.8320, 'Café central friendly'),
  ('Centre LGBTI Lyon', 'association', '19 Rue des Capucins, Lyon', 45.7634, 4.8298, 'Association LGBTI+ de Lyon');
