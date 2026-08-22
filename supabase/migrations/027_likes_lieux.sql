create table if not exists public.likes_lieux (
  id uuid default gen_random_uuid() primary key,
  lieu_id uuid references public.lieux(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(lieu_id, user_id)
);

alter table public.likes_lieux enable row level security;

grant select, insert, update, delete on public.likes_lieux to authenticated;
revoke all on public.likes_lieux from anon;

drop policy if exists "voit les likes" on public.likes_lieux;
create policy "voit les likes" on public.likes_lieux
  for select using (auth.uid() is not null);

drop policy if exists "gere son like" on public.likes_lieux;
create policy "gere son like" on public.likes_lieux
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
