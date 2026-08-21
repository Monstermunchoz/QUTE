alter table public.profiles
  add column if not exists identites text[] default '{}',
  add column if not exists orientations text[] default '{}',
  add column if not exists ce_que_je_cherche text,
  add column if not exists interets text[] default '{}',
  add column if not exists zone text;

create table public.blocages (
  id uuid default gen_random_uuid() primary key,
  bloqueur_id uuid references public.profiles(id) on delete cascade,
  bloque_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(bloqueur_id, bloque_id)
);

alter table public.blocages enable row level security;

create policy "gere ses blocages" on public.blocages
  for all using (auth.uid() = bloqueur_id);
