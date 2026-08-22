create table if not exists public.photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  url text not null,
  ordre integer default 0,
  statut text default 'approved' check (statut in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

alter table public.photos enable row level security;

drop policy if exists "voit les photos approuvees" on public.photos;
create policy "voit les photos approuvees" on public.photos
  for select using (statut = 'approved');

drop policy if exists "gere ses photos" on public.photos;
create policy "gere ses photos" on public.photos
  for all using (auth.uid() = user_id);
