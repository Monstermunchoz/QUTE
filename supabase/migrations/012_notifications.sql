-- Notifications (012 : 010_admin_role_read existe déjà)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text check (type in ('match','message','message_attente','evenement','salon','systeme')),
  titre text not null,
  contenu text,
  lien text,
  lu boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

drop policy if exists "voit ses notifications" on public.notifications;
create policy "voit ses notifications" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "marque lu" on public.notifications;
create policy "marque lu" on public.notifications
  for update using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;

-- Trigger : notif au match
create or replace function public.notify_match()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, titre, contenu, lien)
  values
    (new.user1_id, 'match', 'Nouveau match ! 🎉', 'Tu as un nouveau match sur QUTE', '/qute'),
    (new.user2_id, 'match', 'Nouveau match ! 🎉', 'Tu as un nouveau match sur QUTE', '/qute');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_match_created on public.matchs;
create trigger on_match_created
  after insert on public.matchs
  for each row execute procedure public.notify_match();

-- Trigger : notif message en attente
create or replace function public.notify_message_attente()
returns trigger as $$
begin
  if new.statut = 'en_attente' then
    insert into public.notifications (user_id, type, titre, contenu, lien)
    values (new.destinataire_id, 'message_attente', 'Nouveau message', 'Quelqu''un t''a envoyé un message', '/qute');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_conversation_created on public.conversations;
create trigger on_conversation_created
  after insert on public.conversations
  for each row execute procedure public.notify_message_attente();

-- Storage avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

drop policy if exists "upload son avatar" on storage.objects;
create policy "upload son avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "update son avatar" on storage.objects;
create policy "update son avatar" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "delete son avatar" on storage.objects;
create policy "delete son avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "voit son avatar" on storage.objects;
create policy "voit son avatar" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "voit avatars approuves" on storage.objects;
create policy "voit avatars approuves" on storage.objects
  for select using (bucket_id = 'avatars');
