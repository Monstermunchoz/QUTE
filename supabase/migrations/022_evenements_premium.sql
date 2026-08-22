drop policy if exists "cree un evenement" on public.evenements;

create policy "cree un evenement" on public.evenements
  for insert with check (
    auth.uid() = createur_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and abonnement in ('qute_plus', 'qute_club')
    )
  );
