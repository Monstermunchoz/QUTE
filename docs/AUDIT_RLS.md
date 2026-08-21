# QUTE — Audit RLS (lot 12)

Deny-by-default : `ENABLE ROW LEVEL SECURITY` sur chaque table métier.
`REVOKE ALL … FROM anon` (migration `013_rls_anon_lockdown.sql`) : la clé anon
sans session ne peut plus lire ni écrire le schéma `public`.

À coller dans le SQL Editor après `012` : `013_rls_anon_lockdown.sql`.

## Anon (non connecté)

| Table | RLS | Lecture anon | Écriture anon |
| --- | --- | --- | --- |
| profiles | oui | non (`auth.uid() is not null` + pending masqué) | non (update = soi) |
| qrushs | oui | non (envoyeur / receveur) | non (insert = envoyeur) |
| matchs | oui | non (user1 / user2) | non (insert trigger only) |
| conversations | oui | non (initiateur / destinataire / match) | non |
| messages | oui | non (membre de la conversation) | non (auteur + conversation) |
| salons | oui | non (`auth.uid()` + public) | non (pas d’insert user) |
| salon_messages | oui | non (`auth.uid()`) | non (auteur = soi) |
| groupes | oui | non (`auth.uid()` + public / membre) | non (créateur = soi) |
| groupe_membres | oui | non (`auth.uid()`) | non (soi) |
| lieux | oui | non (`auth.uid()`) | non (pas d’insert user) |
| evenements | oui | non (`auth.uid()` + `publie`, ou créateur / staff) | non (créateur) |
| participations | oui | non (`auth.uid()`) | non (soi) |
| je_sors | oui | non (`auth.uid()` + expires_at) | non (soi) |
| signalements | oui | non (rapporteur / staff) | non (rapporteur = soi) |
| notifications | oui | non (destinataire) | non (triggers only) |
| blocages | oui | non (bloqueur = soi) | non (bloqueur = soi) |

Avant 013, plusieurs policies `USING (true)` laissaient l’anon lire
`profiles`, `salons`, `salon_messages`, `groupes`, `groupe_membres`,
`lieux`, `evenements` publiés, `participations` et `je_sors` (`visibilite = tous`).

## Connecté

- Discovery : `photo_status = pending` invisible (RLS + filtre app).
- Chat : messages limités aux conversations dont on est partie.
- QRUSH / matchs : uniquement ses lignes.
- Admin : `is_staff()` pour signalements, événements, update/delete profils.
- Storage `avatars` : `pending.jpg` = propriétaire ou staff.

## Données sensibles

- Pas de GPS utilisateur en base ni dans les réponses. Carte = **lieux**
  (lat/lng de bars/clubs), accessibles seulement si connecté.
- `date_naissance` n’est plus chargée sur `/explorer/[id]`.
- `.env.local` est dans `.gitignore`. Aucune `SUPABASE_SERVICE_ROLE_KEY`
  dans le client (`NEXT_PUBLIC_*` uniquement : URL + anon key + Turnstile).
- 18+ : Zod + trigger `enforce_adult_profile` + metadata `date_naissance`
  à l’inscription.
