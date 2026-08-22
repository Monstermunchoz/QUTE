alter table public.profiles
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text,
  add column if not exists abonnement_statut text default 'inactif'
    check (abonnement_statut in ('inactif','essai','actif','annule','impaye')),
  add column if not exists abonnement_fin timestamptz,
  add column if not exists essai_utilise boolean default false,
  add column if not exists mode_discret boolean default false;

create index if not exists idx_profiles_stripe_customer
  on public.profiles(stripe_customer_id);

update public.profiles
set abonnement_statut = 'actif'
where abonnement in ('qute_plus', 'qute_club')
  and (abonnement_statut is null or abonnement_statut = 'inactif');

create table if not exists public.paiements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  stripe_invoice_id text unique,
  montant integer not null,
  devise text default 'eur',
  statut text not null,
  plan text,
  facture_url text,
  created_at timestamptz default now()
);

create index if not exists idx_paiements_user on public.paiements(user_id);

alter table public.paiements enable row level security;

drop policy if exists "voit ses paiements" on public.paiements;
create policy "voit ses paiements" on public.paiements
  for select using (auth.uid() = user_id);

drop policy if exists "cree un salon" on public.salons;
create policy "cree un salon" on public.salons
  for insert with check (
    auth.uid() = createur_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and abonnement in ('qute_plus','qute_club')
      and abonnement_statut in ('essai','actif','annule')
    )
  );

drop policy if exists "cree un evenement" on public.evenements;
create policy "cree un evenement" on public.evenements
  for insert with check (
    auth.uid() = createur_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and abonnement in ('qute_plus','qute_club')
      and abonnement_statut in ('essai','actif','annule')
    )
  );

create or replace function public.enforce_qrush_quota()
returns trigger as $$
declare
  plan text;
  statut text;
  n integer;
begin
  select abonnement, abonnement_statut into plan, statut
  from public.profiles
  where id = new.envoyeur_id;

  if plan in ('qute_plus', 'qute_club')
     and statut in ('essai', 'actif', 'annule') then
    return new;
  end if;

  select count(*) into n
  from public.qrushs
  where envoyeur_id = new.envoyeur_id
    and created_at >= date_trunc('day', now());

  if n >= 20 then
    raise exception 'quota_qrush'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists enforce_qrush_quota on public.qrushs;
create trigger enforce_qrush_quota
  before insert on public.qrushs
  for each row execute procedure public.enforce_qrush_quota();
