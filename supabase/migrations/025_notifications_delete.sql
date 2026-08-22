drop policy if exists "supprime ses notifications" on public.notifications;
create policy "supprime ses notifications" on public.notifications
  for delete using (auth.uid() = user_id);
