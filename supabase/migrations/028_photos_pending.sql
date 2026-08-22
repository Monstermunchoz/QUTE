drop trigger if exists on_photo_upload on public.profiles;
drop function if exists public.auto_approve_photo();

alter table public.photos
  alter column statut set default 'pending';

drop policy if exists "staff voit photos" on public.photos;
create policy "staff voit photos" on public.photos
  for select using (public.is_staff());

drop policy if exists "staff gere photos" on public.photos;
create policy "staff gere photos" on public.photos
  for update using (public.is_staff())
  with check (public.is_staff());

notify pgrst, 'reload schema';
