alter table public.je_sors
  add column if not exists lieu_libre text check (char_length(lieu_libre) <= 100);
