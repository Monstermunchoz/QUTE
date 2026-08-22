create table if not exists public.amis (
  id uuid default gen_random_uuid() primary key,
  demandeur_id uuid references public.profiles(id) on delete cascade,
  destinataire_id uuid references public.profiles(id) on delete cascade,
  statut text default 'en_attente' check (statut in ('en_attente','accepte','refuse')),
  created_at timestamptz default now(),
  unique(demandeur_id, destinataire_id)
);

alter table public.amis enable row level security;

drop policy if exists "voit ses relations" on public.amis;
create policy "voit ses relations" on public.amis
  for select using (auth.uid() = demandeur_id or auth.uid() = destinataire_id);

drop policy if exists "envoie une demande" on public.amis;
create policy "envoie une demande" on public.amis
  for insert with check (auth.uid() = demandeur_id);

drop policy if exists "repond a une demande" on public.amis;
create policy "repond a une demande" on public.amis
  for update using (auth.uid() = destinataire_id);

drop policy if exists "retire un ami" on public.amis;
create policy "retire un ami" on public.amis
  for delete using (auth.uid() = demandeur_id or auth.uid() = destinataire_id);

create or replace function public.notify_demande_ami()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, titre, contenu, lien)
  values (new.destinataire_id, 'systeme', 'Nouvelle demande d''ami', 'Quelqu''un souhaite t''ajouter', '/amis');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_demande_ami on public.amis;
create trigger on_demande_ami
  after insert on public.amis
  for each row execute procedure public.notify_demande_ami();
