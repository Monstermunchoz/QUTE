alter table public.profiles
  add column if not exists banni boolean default false,
  add column if not exists email_banni text;

create table if not exists public.emails_bannis (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  raison text,
  banni_par uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.emails_bannis enable row level security;

revoke all on public.emails_bannis from anon, public;
grant select, insert on public.emails_bannis to authenticated;

drop policy if exists "staff lit emails bannis" on public.emails_bannis;
create policy "staff lit emails bannis" on public.emails_bannis
  for select using (public.is_staff());

drop policy if exists "staff insert emails bannis" on public.emails_bannis;
create policy "staff insert emails bannis" on public.emails_bannis
  for insert with check (public.is_staff());

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

drop trigger if exists prevent_banned_signup on auth.users;
create trigger prevent_banned_signup
  before insert on auth.users
  for each row execute procedure public.prevent_banned_signup();

notify pgrst, 'reload schema';
