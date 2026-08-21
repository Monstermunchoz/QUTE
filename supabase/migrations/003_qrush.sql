-- Table QRUSH
create table public.qrushs (
  id uuid default gen_random_uuid() primary key,
  envoyeur_id uuid references public.profiles(id) on delete cascade,
  receveur_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(envoyeur_id, receveur_id)
);

alter table public.qrushs enable row level security;

create policy "voit ses qrushs" on public.qrushs
  for select using (auth.uid() = envoyeur_id or auth.uid() = receveur_id);

create policy "envoie un qrush" on public.qrushs
  for insert with check (auth.uid() = envoyeur_id);

create policy "supprime son qrush" on public.qrushs
  for delete using (auth.uid() = envoyeur_id);

-- Table MATCHS
create table public.matchs (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references public.profiles(id) on delete cascade,
  user2_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user1_id, user2_id)
);

alter table public.matchs enable row level security;

create policy "voit ses matchs" on public.matchs
  for select using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Fonction : crée un match si QRUSH mutuel
create or replace function public.check_match()
returns trigger as $$
begin
  if exists (
    select 1 from public.qrushs
    where envoyeur_id = new.receveur_id
    and receveur_id = new.envoyeur_id
  ) then
    insert into public.matchs (user1_id, user2_id)
    values (least(new.envoyeur_id, new.receveur_id),
            greatest(new.envoyeur_id, new.receveur_id))
    on conflict do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_qrush_created
  after insert on public.qrushs
  for each row execute procedure public.check_match();
