-- JE SORS
create table public.je_sors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique,
  statut text check (statut in ('je_sors','disponible','a_un_evenement','dans_un_lieu')),
  evenement_id uuid references public.evenements(id),
  lieu_id uuid references public.lieux(id),
  message text check (char_length(message) <= 200),
  zone text,
  visibilite text default 'tous' check (visibilite in ('tous','matchs','groupe')),
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

alter table public.je_sors enable row level security;

-- Visible uniquement si pas expiré (et visibilité respectée)
create policy "voit les je_sors actifs" on public.je_sors
  for select using (
    expires_at > now()
    and (
      visibilite = 'tous'
      or auth.uid() = user_id
      or (
        visibilite = 'matchs'
        and exists (
          select 1 from public.matchs m
          where (m.user1_id = auth.uid() and m.user2_id = user_id)
             or (m.user2_id = auth.uid() and m.user1_id = user_id)
        )
      )
    )
  );

create policy "gere son je_sors" on public.je_sors
  for all using (auth.uid() = user_id);

-- Nettoyage auto des JE SORS expirés (cron Supabase ou via requête)
-- Pour MVP : filtrer expires_at > now() côté client ET côté RLS
