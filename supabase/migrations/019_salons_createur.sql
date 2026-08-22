alter table public.profiles
  add column if not exists abonnement text default 'gratuit'
  check (abonnement in ('gratuit', 'qute_plus', 'qute_club'));

alter table public.salons
  add column if not exists createur_id uuid references public.profiles(id);

drop policy if exists "voit ses salons" on public.salons;
create policy "voit ses salons" on public.salons
  for select using (auth.uid() = createur_id);

drop policy if exists "cree un salon" on public.salons;
create policy "cree un salon" on public.salons
  for insert with check (
    auth.uid() = createur_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and abonnement in ('qute_plus', 'qute_club')
    )
  );
