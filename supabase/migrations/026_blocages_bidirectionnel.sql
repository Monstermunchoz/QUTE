drop policy if exists "voit les blocages me concernant" on public.blocages;
create policy "voit les blocages me concernant" on public.blocages
  for select using (
    auth.uid() = bloqueur_id or auth.uid() = bloque_id
  );
