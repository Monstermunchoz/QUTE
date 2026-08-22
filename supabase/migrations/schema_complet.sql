-- =============================================================================
-- QUTE — schéma courant fusionné (idempotent)
-- =============================================================================
-- Source : supabase/migrations/001 … 028 (les fichiers numérotés restent
-- l’historique). Ce fichier reconstruit l’état FINAL pour une base vide
-- ou aligne une base existante (create if not exists / add column if not
-- exists / drop policy + create policy).
--
-- Contradictions tranchées (les plus récentes gagnent) :
--   • profiles.photo_status        default 'pending'          (001, inchangé)
--   • photos.statut                default 'pending'          (028 > 014/016)
--   • pas de trigger on_photo_upload / fonction auto_approve_photo (028)
--   • handle_new_user              version 015 (ne bloque jamais auth.users)
--   • ban email                    trigger prevent_banned_signup (024)
--   • lecture profils              014_discovery_visible (profils pending
--                                  visibles ; rejected masqué ; photos pending
--                                  masquées côté app + storage pending.jpg
--                                  réservé soi/staff)
--   • création salon / événement   023 (abonnement + abonnement_statut)
--   • blocages                     002 + SELECT bidirectionnel (026)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tables + colonnes
-- ---------------------------------------------------------------------------

-- 1.1 profiles (001 + 002 + 009 + 019 + 021 + 023 + 024)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  pseudo text not null unique,
  bio text,
  ville text,
  age_visible boolean default false,
  date_naissance date,
  photo_url text,
  photo_status text default 'pending' check (photo_status in ('pending','approved','rejected')),
  compte_verifie boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles
  add column if not exists identites text[] default '{}',
  add column if not exists orientations text[] default '{}',
  add column if not exists ce_que_je_cherche text,
  add column if not exists interets text[] default '{}',
  add column if not exists zone text,
  add column if not exists role text default 'user',
  add column if not exists abonnement text default 'gratuit',
  add column if not exists pronoms text,
  add column if not exists recherche text[] default '{}',
  add column if not exists langues text[] default '{}',
  add column if not exists instagram text,
  add column if not exists visibilite_identites text default 'public',
  add column if not exists visibilite_orientations text default 'public',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists abonnement_statut text default 'inactif',
  add column if not exists abonnement_fin timestamptz,
  add column if not exists essai_utilise boolean default false,
  add column if not exists mode_discret boolean default false,
  add column if not exists banni boolean default false,
  add column if not exists email_banni text;

alter table public.profiles
  alter column photo_status set default 'pending';

do $$ begin
  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('user','moderateur','admin'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles
    add constraint profiles_abonnement_check
    check (abonnement in ('gratuit', 'qute_plus', 'qute_club'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles
    add constraint profiles_visibilite_identites_check
    check (visibilite_identites in ('public','matchs','prive'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles
    add constraint profiles_visibilite_orientations_check
    check (visibilite_orientations in ('public','matchs','prive'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles
    add constraint profiles_abonnement_statut_check
    check (abonnement_statut in ('inactif','essai','actif','annule','impaye'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles
    add constraint profiles_stripe_customer_id_key unique (stripe_customer_id);
exception when duplicate_object then null;
end $$;

create index if not exists idx_profiles_stripe_customer
  on public.profiles(stripe_customer_id);

-- 1.2 blocages (002 + 026)
create table if not exists public.blocages (
  id uuid default gen_random_uuid() primary key,
  bloqueur_id uuid references public.profiles(id) on delete cascade,
  bloque_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(bloqueur_id, bloque_id)
);

-- 1.3 qrushs / matchs (003)
create table if not exists public.qrushs (
  id uuid default gen_random_uuid() primary key,
  envoyeur_id uuid references public.profiles(id) on delete cascade,
  receveur_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(envoyeur_id, receveur_id)
);

create table if not exists public.matchs (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references public.profiles(id) on delete cascade,
  user2_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user1_id, user2_id)
);

-- 1.4 conversations / messages (004 + 006)
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matchs(id) on delete cascade unique,
  created_at timestamptz default now()
);

alter table public.conversations
  alter column match_id drop not null;

alter table public.conversations
  add column if not exists statut text default 'acceptee',
  add column if not exists initiateur_id uuid references public.profiles(id),
  add column if not exists destinataire_id uuid references public.profiles(id);

do $$ begin
  alter table public.conversations
    add constraint conversations_statut_check
    check (statut in ('en_attente','acceptee','ignoree'));
exception when duplicate_object then null;
end $$;

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  auteur_id uuid references public.profiles(id) on delete cascade,
  contenu text not null check (char_length(contenu) <= 1000),
  created_at timestamptz default now()
);

-- 1.5 salons / salon_messages (005 + 019)
create table if not exists public.salons (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  description text,
  theme text,
  region text default 'Lyon Métropole',
  est_public boolean default true,
  created_at timestamptz default now()
);

alter table public.salons
  add column if not exists createur_id uuid references public.profiles(id);

create table if not exists public.salon_messages (
  id uuid default gen_random_uuid() primary key,
  salon_id uuid references public.salons(id) on delete cascade,
  auteur_id uuid references public.profiles(id) on delete cascade,
  contenu text not null check (char_length(contenu) <= 1000),
  created_at timestamptz default now()
);

-- 1.6 groupes (005)
create table if not exists public.groupes (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  description text,
  createur_id uuid references public.profiles(id) on delete cascade,
  est_prive boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.groupe_membres (
  id uuid default gen_random_uuid() primary key,
  groupe_id uuid references public.groupes(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'membre' check (role in ('admin','moderateur','membre')),
  joined_at timestamptz default now(),
  unique(groupe_id, user_id)
);

-- 1.7 lieux (006)
create table if not exists public.lieux (
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

-- 1.8 evenements / participations (007)
create table if not exists public.evenements (
  id uuid default gen_random_uuid() primary key,
  titre text not null,
  description text,
  lieu_id uuid references public.lieux(id),
  lieu_nom text,
  adresse text,
  date_debut timestamptz not null,
  date_fin timestamptz,
  createur_id uuid references public.profiles(id) on delete cascade,
  statut text default 'pending' check (statut in ('pending','publie','refuse')),
  categorie text check (categorie in ('soiree','concert','culture','sport','rencontre','association','autre')),
  image_url text,
  max_participants integer,
  created_at timestamptz default now()
);

create table if not exists public.participations (
  id uuid default gen_random_uuid() primary key,
  evenement_id uuid references public.evenements(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  statut text default 'interesse' check (statut in ('interesse','participe','absent')),
  created_at timestamptz default now(),
  unique(evenement_id, user_id)
);

-- 1.9 je_sors (008 + 018)
create table if not exists public.je_sors (
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

alter table public.je_sors
  add column if not exists lieu_libre text;

do $$ begin
  alter table public.je_sors
    add constraint je_sors_lieu_libre_check
    check (char_length(lieu_libre) <= 100);
exception when duplicate_object then null;
end $$;

-- 1.10 signalements (009)
create table if not exists public.signalements (
  id uuid default gen_random_uuid() primary key,
  rapporteur_id uuid references public.profiles(id) on delete cascade,
  cible_id uuid references public.profiles(id) on delete cascade,
  type text check (type in ('profil','message','salon','evenement','autre')),
  raison text not null check (char_length(raison) <= 500),
  statut text default 'en_attente' check (statut in ('en_attente','traite','rejete')),
  note_admin text,
  created_at timestamptz default now()
);

-- 1.11 notifications (012 + 025)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text check (type in ('match','message','message_attente','evenement','salon','systeme')),
  titre text not null,
  contenu text,
  lien text,
  lu boolean default false,
  created_at timestamptz default now()
);

-- 1.12 photos album (014_album / 016 + 028)
create table if not exists public.photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  url text not null,
  ordre integer default 0,
  statut text default 'pending' check (statut in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

alter table public.photos
  alter column statut set default 'pending';

-- 1.13 amis (020)
create table if not exists public.amis (
  id uuid default gen_random_uuid() primary key,
  demandeur_id uuid references public.profiles(id) on delete cascade,
  destinataire_id uuid references public.profiles(id) on delete cascade,
  statut text default 'en_attente' check (statut in ('en_attente','accepte','refuse')),
  created_at timestamptz default now(),
  unique(demandeur_id, destinataire_id)
);

-- 1.14 paiements (023)
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

-- 1.15 emails_bannis (024)
create table if not exists public.emails_bannis (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  raison text,
  banni_par uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 1.16 likes_lieux (027)
create table if not exists public.likes_lieux (
  id uuid default gen_random_uuid() primary key,
  lieu_id uuid references public.lieux(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(lieu_id, user_id)
);

-- Données 023 : aligner le statut d’abonnement des profils déjà premium
update public.profiles
set abonnement_statut = 'actif'
where abonnement in ('qute_plus', 'qute_club')
  and (abonnement_statut is null or abonnement_statut = 'inactif');

-- ---------------------------------------------------------------------------
-- 2. RLS sur toutes les tables public
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.blocages enable row level security;
alter table public.qrushs enable row level security;
alter table public.matchs enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.salons enable row level security;
alter table public.salon_messages enable row level security;
alter table public.groupes enable row level security;
alter table public.groupe_membres enable row level security;
alter table public.lieux enable row level security;
alter table public.evenements enable row level security;
alter table public.participations enable row level security;
alter table public.je_sors enable row level security;
alter table public.signalements enable row level security;
alter table public.notifications enable row level security;
alter table public.photos enable row level security;
alter table public.amis enable row level security;
alter table public.paiements enable row level security;
alter table public.emails_bannis enable row level security;
alter table public.likes_lieux enable row level security;

-- ---------------------------------------------------------------------------
-- 3. Droits (013 lockdown + exceptions 024 / 027)
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

revoke all on public.emails_bannis from anon, public;
grant select, insert on public.emails_bannis to authenticated;

grant select, insert, update, delete on public.likes_lieux to authenticated;
revoke all on public.likes_lieux from anon;

-- ---------------------------------------------------------------------------
-- 4. Fonctions
-- ---------------------------------------------------------------------------

-- 011 : ancien trigger de protection de rôle (dangereux dans le SQL Editor)
drop trigger if exists protect_profile_moderation on public.profiles;
drop function if exists public.protect_profile_moderation();

-- 028 : plus d’auto-approbation de photo
drop trigger if exists on_photo_upload on public.profiles;
drop function if exists public.auto_approve_photo();

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','moderateur')
  );
$$;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- 015 : l’échec du trigger ne doit jamais empêcher auth.users d’être créé
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  birth date;
  nick text;
begin
  nick := nullif(trim(coalesce(new.raw_user_meta_data->>'pseudo', '')), '');
  if nick is null then
    nick := 'qute_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  if coalesce(new.raw_user_meta_data->>'date_naissance', '') <> '' then
    begin
      birth := (new.raw_user_meta_data->>'date_naissance')::date;
    exception
      when others then
        birth := null;
    end;

    if birth is not null
       and birth > (current_date - interval '18 years') then
      birth := null;
    end if;
  end if;

  begin
    insert into public.profiles (id, pseudo, date_naissance)
    values (new.id, nick, birth)
    on conflict (id) do nothing;
  exception
    when unique_violation then
      insert into public.profiles (id, pseudo)
      values (
        new.id,
        nick || '_' || substr(replace(new.id::text, '-', ''), 1, 4)
      )
      on conflict (id) do nothing;
    when others then
      raise warning 'handle_new_user: %', sqlerrm;
  end;

  return new;
exception
  when others then
    raise warning 'handle_new_user fatal: %', sqlerrm;
    return new;
end;
$$;

create or replace function public.enforce_adult_profile()
returns trigger
language plpgsql
as $$
begin
  if new.date_naissance is not null
     and new.date_naissance > (current_date - interval '18 years') then
    raise exception 'Tu dois avoir 18 ans ou plus.';
  end if;
  return new;
end;
$$;

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

create or replace function public.notify_match()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, titre, contenu, lien)
  values
    (new.user1_id, 'match', 'Nouveau match ! 🎉', 'Tu as un nouveau match sur QUTE', '/qute'),
    (new.user2_id, 'match', 'Nouveau match ! 🎉', 'Tu as un nouveau match sur QUTE', '/qute');
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.notify_message_attente()
returns trigger as $$
begin
  if new.statut = 'en_attente' then
    insert into public.notifications (user_id, type, titre, contenu, lien)
    values (new.destinataire_id, 'message_attente', 'Nouveau message', 'Quelqu''un t''a envoyé un message', '/qute');
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.notify_demande_ami()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, titre, contenu, lien)
  values (new.destinataire_id, 'systeme', 'Nouvelle demande d''ami', 'Quelqu''un souhaite t''ajouter', '/amis');
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.email_est_banni(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.emails_bannis
    where lower(email) = lower(trim(coalesce(p_email, '')))
  );
$$;

revoke all on function public.email_est_banni(text) from public;
grant execute on function public.email_est_banni(text) to anon, authenticated;

-- 024 : contrôle d’email banni (séparé de handle_new_user, BEFORE INSERT)
create or replace function public.prevent_banned_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.emails_bannis
    where lower(email) = lower(trim(coalesce(new.email, '')))
  ) then
    raise exception 'Cette adresse email a été bannie de QUTE.';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists prevent_banned_signup on auth.users;
create trigger prevent_banned_signup
  before insert on auth.users
  for each row execute procedure public.prevent_banned_signup();

drop trigger if exists enforce_adult_profile on public.profiles;
create trigger enforce_adult_profile
  before insert or update of date_naissance on public.profiles
  for each row execute procedure public.enforce_adult_profile();

drop trigger if exists on_qrush_created on public.qrushs;
create trigger on_qrush_created
  after insert on public.qrushs
  for each row execute procedure public.check_match();

drop trigger if exists enforce_qrush_quota on public.qrushs;
create trigger enforce_qrush_quota
  before insert on public.qrushs
  for each row execute procedure public.enforce_qrush_quota();

drop trigger if exists on_match_created on public.matchs;
create trigger on_match_created
  after insert on public.matchs
  for each row execute procedure public.notify_match();

drop trigger if exists on_conversation_created on public.conversations;
create trigger on_conversation_created
  after insert on public.conversations
  for each row execute procedure public.notify_message_attente();

drop trigger if exists on_demande_ami on public.amis;
create trigger on_demande_ami
  after insert on public.amis
  for each row execute procedure public.notify_demande_ami();

-- ---------------------------------------------------------------------------
-- 6. Policies RLS (état final)
-- ---------------------------------------------------------------------------

-- 6.1 profiles
drop policy if exists "lecture profil public" on public.profiles;
drop policy if exists "lecture profil connecte" on public.profiles;
drop policy if exists "admin voit profils" on public.profiles;
drop policy if exists "modif son propre profil" on public.profiles;
drop policy if exists "admin modifie profils" on public.profiles;
drop policy if exists "admin supprime profils" on public.profiles;

create policy "lecture profil connecte" on public.profiles
  for select using (
    auth.uid() is not null
    and (
      id = auth.uid()
      or photo_status is distinct from 'rejected'
      or public.is_staff()
    )
  );

create policy "modif son propre profil" on public.profiles
  for update using (auth.uid() = id);

create policy "admin modifie profils" on public.profiles
  for update using (public.is_staff())
  with check (public.is_staff());

create policy "admin supprime profils" on public.profiles
  for delete using (public.is_staff());

-- 6.2 blocages
drop policy if exists "gere ses blocages" on public.blocages;
drop policy if exists "voit les blocages me concernant" on public.blocages;

create policy "gere ses blocages" on public.blocages
  for all using (auth.uid() = bloqueur_id);

create policy "voit les blocages me concernant" on public.blocages
  for select using (
    auth.uid() = bloqueur_id or auth.uid() = bloque_id
  );

-- 6.3 qrushs
drop policy if exists "voit ses qrushs" on public.qrushs;
drop policy if exists "envoie un qrush" on public.qrushs;
drop policy if exists "supprime son qrush" on public.qrushs;

create policy "voit ses qrushs" on public.qrushs
  for select using (auth.uid() = envoyeur_id or auth.uid() = receveur_id);

create policy "envoie un qrush" on public.qrushs
  for insert with check (auth.uid() = envoyeur_id);

create policy "supprime son qrush" on public.qrushs
  for delete using (auth.uid() = envoyeur_id);

-- 6.4 matchs
drop policy if exists "voit ses matchs" on public.matchs;

create policy "voit ses matchs" on public.matchs
  for select using (auth.uid() = user1_id or auth.uid() = user2_id);

-- 6.5 conversations
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

-- 6.6 messages
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

-- 6.7 salons
drop policy if exists "lecture salons publics" on public.salons;
drop policy if exists "voit ses salons" on public.salons;
drop policy if exists "cree un salon" on public.salons;

create policy "lecture salons publics" on public.salons
  for select using (auth.uid() is not null and est_public = true);

create policy "voit ses salons" on public.salons
  for select using (auth.uid() = createur_id);

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

-- 6.8 salon_messages
drop policy if exists "lecture messages salon" on public.salon_messages;
drop policy if exists "envoie message salon" on public.salon_messages;

create policy "lecture messages salon" on public.salon_messages
  for select using (auth.uid() is not null);

create policy "envoie message salon" on public.salon_messages
  for insert with check (auth.uid() = auteur_id);

-- 6.9 groupes
drop policy if exists "lecture groupes publics" on public.groupes;
drop policy if exists "voit ses groupes prives" on public.groupes;
drop policy if exists "cree un groupe" on public.groupes;

create policy "lecture groupes publics" on public.groupes
  for select using (auth.uid() is not null and est_prive = false);

create policy "voit ses groupes prives" on public.groupes
  for select using (
    createur_id = auth.uid()
    or exists (
      select 1 from public.groupe_membres gm
      where gm.groupe_id = id
      and gm.user_id = auth.uid()
    )
  );

create policy "cree un groupe" on public.groupes
  for insert with check (auth.uid() = createur_id);

-- 6.10 groupe_membres
drop policy if exists "voit les membres" on public.groupe_membres;
drop policy if exists "rejoint un groupe" on public.groupe_membres;
drop policy if exists "quitte un groupe" on public.groupe_membres;

create policy "voit les membres" on public.groupe_membres
  for select using (auth.uid() is not null);

create policy "rejoint un groupe" on public.groupe_membres
  for insert with check (auth.uid() = user_id);

create policy "quitte un groupe" on public.groupe_membres
  for delete using (auth.uid() = user_id);

-- 6.11 lieux
drop policy if exists "lecture lieux" on public.lieux;

create policy "lecture lieux" on public.lieux
  for select using (auth.uid() is not null);

-- 6.12 evenements
drop policy if exists "lecture evenements publies" on public.evenements;
drop policy if exists "voit ses propres evenements" on public.evenements;
drop policy if exists "cree un evenement" on public.evenements;
drop policy if exists "modifie son evenement" on public.evenements;
drop policy if exists "admin gere evenements" on public.evenements;

create policy "lecture evenements publies" on public.evenements
  for select using (auth.uid() is not null and statut = 'publie');

create policy "voit ses propres evenements" on public.evenements
  for select using (auth.uid() = createur_id);

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

create policy "modifie son evenement" on public.evenements
  for update using (auth.uid() = createur_id and statut = 'pending');

create policy "admin gere evenements" on public.evenements
  for all using (public.is_staff());

-- 6.13 participations
drop policy if exists "voit les participations" on public.participations;
drop policy if exists "gere sa participation" on public.participations;

create policy "voit les participations" on public.participations
  for select using (auth.uid() is not null);

create policy "gere sa participation" on public.participations
  for all using (auth.uid() = user_id);

-- 6.14 je_sors
drop policy if exists "voit les je_sors actifs" on public.je_sors;
drop policy if exists "gere son je_sors" on public.je_sors;

create policy "voit les je_sors actifs" on public.je_sors
  for select using (
    auth.uid() is not null
    and expires_at > now()
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

-- 6.15 signalements
drop policy if exists "cree un signalement" on public.signalements;
drop policy if exists "voit ses signalements" on public.signalements;
drop policy if exists "admin voit tout" on public.signalements;

create policy "cree un signalement" on public.signalements
  for insert with check (auth.uid() = rapporteur_id);

create policy "voit ses signalements" on public.signalements
  for select using (auth.uid() = rapporteur_id);

create policy "admin voit tout" on public.signalements
  for all using (public.is_staff());

-- 6.16 notifications
drop policy if exists "voit ses notifications" on public.notifications;
drop policy if exists "marque lu" on public.notifications;
drop policy if exists "supprime ses notifications" on public.notifications;

create policy "voit ses notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "marque lu" on public.notifications
  for update using (auth.uid() = user_id);

create policy "supprime ses notifications" on public.notifications
  for delete using (auth.uid() = user_id);

-- 6.17 photos
drop policy if exists "voit les photos approuvees" on public.photos;
drop policy if exists "gere ses photos" on public.photos;
drop policy if exists "staff voit photos" on public.photos;
drop policy if exists "staff gere photos" on public.photos;

create policy "voit les photos approuvees" on public.photos
  for select using (statut = 'approved');

create policy "gere ses photos" on public.photos
  for all using (auth.uid() = user_id);

create policy "staff voit photos" on public.photos
  for select using (public.is_staff());

create policy "staff gere photos" on public.photos
  for update using (public.is_staff())
  with check (public.is_staff());

-- 6.18 amis
drop policy if exists "voit ses relations" on public.amis;
drop policy if exists "envoie une demande" on public.amis;
drop policy if exists "repond a une demande" on public.amis;
drop policy if exists "retire un ami" on public.amis;

create policy "voit ses relations" on public.amis
  for select using (auth.uid() = demandeur_id or auth.uid() = destinataire_id);

create policy "envoie une demande" on public.amis
  for insert with check (auth.uid() = demandeur_id);

create policy "repond a une demande" on public.amis
  for update using (auth.uid() = destinataire_id);

create policy "retire un ami" on public.amis
  for delete using (auth.uid() = demandeur_id or auth.uid() = destinataire_id);

-- 6.19 paiements
drop policy if exists "voit ses paiements" on public.paiements;

create policy "voit ses paiements" on public.paiements
  for select using (auth.uid() = user_id);

-- 6.20 emails_bannis
drop policy if exists "staff lit emails bannis" on public.emails_bannis;
drop policy if exists "staff insert emails bannis" on public.emails_bannis;

create policy "staff lit emails bannis" on public.emails_bannis
  for select using (public.is_staff());

create policy "staff insert emails bannis" on public.emails_bannis
  for insert with check (public.is_staff());

-- 6.21 likes_lieux
drop policy if exists "voit les likes" on public.likes_lieux;
drop policy if exists "gere son like" on public.likes_lieux;

create policy "voit les likes" on public.likes_lieux
  for select using (auth.uid() is not null);

create policy "gere son like" on public.likes_lieux
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 7. Storage — bucket avatars (012 + 013)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

drop policy if exists "upload son avatar" on storage.objects;
create policy "upload son avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "update son avatar" on storage.objects;
create policy "update son avatar" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "delete son avatar" on storage.objects;
create policy "delete son avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "voit son avatar" on storage.objects;
create policy "voit son avatar" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "voit avatars approuves" on storage.objects;
drop policy if exists "voit avatars hors pending" on storage.objects;
drop policy if exists "staff voit avatars" on storage.objects;

create policy "voit avatars hors pending" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and name not like '%/pending.jpg'
  );

create policy "staff voit avatars" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and public.is_staff()
  );

-- ---------------------------------------------------------------------------
-- 8. Realtime (uniquement les tables ajoutées dans les fichiers numérotés)
-- ---------------------------------------------------------------------------

do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.salon_messages;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 9. Données de base (salons / lieux Lyon) — idempotent par nom
-- ---------------------------------------------------------------------------

insert into public.salons (nom, description, theme)
select v.nom, v.description, v.theme
from (values
  ('Lyon Général', 'Le salon principal de la communauté QUTE Lyon', 'general'),
  ('Sorties ce soir', 'Où est-ce qu''on sort ce soir ?', 'sorties'),
  ('Techno Lyon', 'La scène techno et électro lyonnaise', 'musique'),
  ('Trans Lyon', 'Espace de discussion pour la communauté trans', 'identite'),
  ('Gay Lyon', 'Salon gay de Lyon', 'identite'),
  ('Lesbiennes Lyon', 'Salon lesbien de Lyon', 'identite'),
  ('Bi/Pan Lyon', 'Pour les bi et pan de Lyon', 'identite'),
  ('Queer Lyon', 'Espace queer ouvert', 'identite'),
  ('Associations', 'Actualités des assos LGBTQIA+ lyonnaises', 'communaute')
) as v(nom, description, theme)
where not exists (select 1 from public.salons s where s.nom = v.nom);

insert into public.lieux (nom, categorie, adresse, latitude, longitude, description)
select v.nom, v.categorie, v.adresse, v.latitude, v.longitude, v.description
from (values
  ('Le Marché Gare', 'club', '35 Rue du Bât d''Argent, Lyon', 45.7489, 4.8317, 'Club techno emblématique de Lyon'),
  ('La Rayonne', 'club', 'Parc de Parilly, Bron', 45.7234, 4.8891, 'Salle de concert et club'),
  ('Le Sucre', 'club', '50 Quai Rambaud, Lyon', 45.7412, 4.8156, 'Club sur les quais, vue panoramique'),
  ('Café de la Cloche', 'cafe', '5 Place Antonin Poncet, Lyon', 45.7578, 4.8320, 'Café central friendly'),
  ('Centre LGBTI Lyon', 'association', '19 Rue des Capucins, Lyon', 45.7634, 4.8298, 'Association LGBTI+ de Lyon')
) as v(nom, categorie, adresse, latitude, longitude, description)
where not exists (select 1 from public.lieux l where l.nom = v.nom);

-- ---------------------------------------------------------------------------
-- 10. Rechargement cache PostgREST
-- ---------------------------------------------------------------------------

notify pgrst, 'reload schema';
