alter table public.profiles
  add column if not exists pronoms text,
  add column if not exists recherche text[] default '{}',
  add column if not exists langues text[] default '{}',
  add column if not exists instagram text,
  add column if not exists visibilite_identites text default 'public'
    check (visibilite_identites in ('public','matchs','prive')),
  add column if not exists visibilite_orientations text default 'public'
    check (visibilite_orientations in ('public','matchs','prive'));
